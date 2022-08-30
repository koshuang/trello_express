//Declaration
const _ = require("lodash");
const { trelloAdapter } = require("../adapters/trelloAdapter");
const { each } = require("lodash");

class CardController {
  async generateReport(request, response) {
    const { from, to, status, label } = request.query;

    const board = await trelloAdapter.getBoard();

    const { cards, actions, lists } = board;

    let updatedCards = this.appendCreatedDate(cards, actions);

    updatedCards = this.appendListName(updatedCards, lists);

    updatedCards = this.filterByStatus(updatedCards, status);

    updatedCards = this.filterByLabel(updatedCards, label);

    updatedCards = this.filterByDateRange(updatedCards, from, to);

    let groupedCardMap = _.groupBy(updatedCards, "updatedListName");

    //Group by month of card created
    for (let cardStatus in groupedCardMap) {
      const cards = groupedCardMap[cardStatus];
      groupedCardMap[cardStatus] = this.groupByMonth(cards, cardStatus);
    }

    let labelNames = this.extractAllLabelNames(groupedCardMap);

    //Group by label
    for (let cardStatus in groupedCardMap) {
      for (let cardMonth in groupedCardMap[cardStatus]) {
        //add list key to sorted array + add value
        const labelCardNumbersMap = this.getMonthlyLabelCardNumbersMap(groupedCardMap, cardStatus, cardMonth, labelNames);
        groupedCardMap[cardStatus][cardMonth] = labelCardNumbersMap;
      }
    }

    response.json(groupedCardMap);
  }

  getMonthlyLabelCardNumbersMap(groupedCardMap, cardStatus, cardMonth, labelNames) {
    let monthlyCards = groupedCardMap[cardStatus][cardMonth]; //array of cards under certain month
    let labelCardNumbersMap = {
      "No Label": 0,
    };
    monthlyCards.forEach((card) => {
      //run through each card
      let labels = card.labels;
      if (labels.length > 0) {
        //if got label
        for (let label of labels) {
          //each label of current card
          if (labelNames.includes(label.name)) {
            let index = labelNames.indexOf(label.name);
            const labelName = labelNames[index];
            const cardNumbers = labelCardNumbersMap[labelName] ?? 0;

            labelCardNumbersMap[labelName] = cardNumbers + 1;
          }
        }
      } else {
        labelCardNumbersMap["No Label"] += 1;
      }
    });
    return labelCardNumbersMap;
  }

  extractAllLabelNames(groupedCardMap) {
    let labelNames = [];
    for (let cardStatus in groupedCardMap) {
      for (let cardMonth in groupedCardMap[cardStatus]) {
        //put label list into array
        let cards = groupedCardMap[cardStatus][cardMonth]; //store array of obj created on certain month to letiable
        _.forEach(cards, (card) => {
          //each card in the result array under certain month
          if (card.labels.length > 0) {
            const filteredLableNames = card.labels
              .filter((label) => !labelNames.includes(label.name))
              .map((label) => label.name);
            labelNames = labelNames.concat(filteredLableNames);
          }
        });
      }
    }
    return labelNames;
  }

  groupByMonth(cards, cardStatus) {
    return _.groupBy(cards, (card) => {
      const createdDate = new Date(card.createdDate);
      return createdDate.toLocaleString("default", { month: "long" });
    });
  }

  filterByDateRange(updatedCards, fromDate, toDate) {
    if (fromDate) {
      updatedCards = updatedCards.filter((card) => card.createdDate >= fromDate);
    }

    if (toDate) {
      updatedCards = updatedCards.filter((card) => card.createdDate <= toDate);
    }
    return updatedCards;
  }

  filterByLabel(updatedCards, label) {
    if (label) {
      updatedCards = updatedCards.filter((card) => {
        const cardLabels = card.labels;
        const labelExist = cardLabels.some(
          (labelOfCard) => labelOfCard.name == label
        );
        if (labelExist) {
          return card;
        }
      });
    }
    return updatedCards;
  }

  filterByStatus(updatedCards, status) {
    const objStatus = {
      Info: ["General Info", "Template"],
      Todo: ["Todo"],
      InProgress: ["In Progress", "Reviewing"],
      Done: ["Closed", "Classes", "Done"],
    };

    //Filter
    //list
    const arrStatus = objStatus[status];
    if (status) {
      updatedCards = updatedCards.filter((card) => arrStatus.includes(card.updatedListName)
      );
    }
    return updatedCards;
  }

  appendListName(updatedCards, lists) {
    return updatedCards.map((card) => {
      const matched = lists.find((list) => card.idList == list.id);

      return {
        updatedListName: matched?.name,
        ...card,
      };
    });
  }

  /**
   * Map created card with date
   *
   * @param {array} cards
   * @param {array} actions
   * @returns {array}
   */
  appendCreatedDate(cards, actions) {
    return cards.map((card) => {
      const action = actions.find(
        (action) =>
          (action.type == "createCard" || action.type == "copyCard") &&
          action.data.card.id === card.id
      );
      return {
        ...card,
        createdDate: action?.date,
      };
    });
  }
}

module.exports = new CardController();
