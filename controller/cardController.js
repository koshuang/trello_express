//Declaration
const _ = require("lodash");
const { trelloAdapter } = require("../adapters/trelloAdapter");
const { each } = require("lodash");

class CardController {
  async generateReport(request, response) {
    const { from, to, status, label } = request.query;

    const board = await trelloAdapter.getBoard();

    const { cards, actions, lists } = board;

    let updatedCards = this.getCardsWithFullDetails(cards, actions);

    updatedCards = this.appendListName(updatedCards, lists);

    updatedCards = this.filterByStatus(updatedCards, status);

    //label
    updatedCards = this.filterByLabel(updatedCards, label);

    updatedCards = this.filterByDateRange(updatedCards, from, to);
    //End of filter

    //Group by list
    var groupedCardMap = _.groupBy(updatedCards, "updatedListName");

    //Group by month of card created
    for (let cardStatus in groupedCardMap) {
      groupedCardMap[cardStatus] = _.groupBy(groupedCardMap[cardStatus], (data) => {
        const createdDate = new Date(data.date);
        return createdDate.toLocaleString("default", { month: "long" });
      });
    }

    //Group by label
    let arrLabel = [];
    for (let cardStatus in groupedCardMap) {
      for (let cardMonth in groupedCardMap[cardStatus]) {
        //put label list into array
        var result = groupedCardMap[cardStatus][cardMonth]; //store array of obj created on certain month to variable
        _.forEach(result, (eachCard) => {
          //each card in the result array under certain month
          if (eachCard.labels.length > 0) {
            _.forEach(eachCard.labels, (labelList) => {
              //for each item in the labels array of certain card
              if (!_.includes(arrLabel, labelList.name)) {
                arrLabel.push(labelList.name);
              }
            });
          }
        });

        //add list key to sorted array + add value
        var arrCard = groupedCardMap[cardStatus][cardMonth]; //array of cards under certain month
        var objCardByLabel = {};
        arrCard.forEach((eachCard) => {
          //run through each card
          var labelList = eachCard.labels;
          if (labelList.length > 0) {
            //if got label
            for (var b = 0; b < labelList.length; b++) {
              //each label of current card
              if (arrLabel.includes(labelList[b].name)) {
                var index = arrLabel.indexOf(labelList[b].name);
                if (arrLabel[index] in objCardByLabel) {
                  var arr = objCardByLabel[arrLabel[index]];
                  arr.push(eachCard.name);
                  objCardByLabel[arrLabel[index]] = arr;
                } else {
                  objCardByLabel[arrLabel[index]] = [eachCard.name];
                }
              }
            }
          } else {
            if ("No Label" in objCardByLabel) {
              var arr = objCardByLabel["No Label"];
              arr.push(eachCard.name);
              objCardByLabel["No Label"] = arr;
            } else {
              objCardByLabel["No Label"] = [eachCard.name];
            }
          }
        });

        groupedCardMap[cardStatus][cardMonth] = objCardByLabel;

        //to display number of cards created
        for (let labelList in groupedCardMap[cardStatus][cardMonth]) {
          groupedCardMap[cardStatus][cardMonth][labelList] = _.size(
            groupedCardMap[cardStatus][cardMonth][labelList]
          );
        }
      }
    }

    response.json(groupedCardMap);
  }

  filterByDateRange(updatedCards, fromDate, toDate) {
    if (fromDate) {
      updatedCards = updatedCards.filter((card) => card.date >= fromDate);
    }

    if (toDate) {
      updatedCards = updatedCards.filter((card) => card.date <= toDate);
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
  getCardsWithFullDetails(cards, actions) {
    return cards.map((card) => {
      const matched = actions.find(
        (action) =>
          (action.type == "createCard" || action.type == "copyCard") &&
          action.data.card.id === card.id
      );
      if (matched) {
        return { ...card, ...matched };
      }
    });
  }
}

module.exports = new CardController();
