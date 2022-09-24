
const _ = require("lodash");

/**
 * Map created card with date
 *
 * @param {array} cards
 * @param {array} actions
 * @returns {array}
 */
class CardService {
  appendDetailInfo(cards, actions, lists) {
    let updatedCards = this.appendCreatedDate(cards, actions);

    updatedCards = this.appendListName(updatedCards, lists);
    return updatedCards;
  }

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

  appendListName(updatedCards, lists) {
    return updatedCards.map((card) => {
      const matched = lists.find((list) => card.idList == list.id);

      return {
        updatedListName: matched?.name,
        ...card,
      };
    });
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
      updatedCards = updatedCards.filter(
        (card) => arrStatus.includes(card.updatedListName)
      );
    }
    return updatedCards;
  }

  groupCards(updatedCards) {
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
    return groupedCardMap;
  }

  groupByMonth(cards) {
    return _.groupBy(cards, (card) => {
      const createdDate = new Date(card.createdDate);
      return createdDate.toLocaleString("default", { month: "long" });
    });
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

    // TODO: should not contain include `No Label` if it's 0

    return labelCardNumbersMap;
  }
}

module.exports = {
  CardService,
  cardService: new CardService(),
};
