//Declaration
const _ = require("lodash");
const { trelloAdapter } = require("../adapters/trelloAdapter");
const { each } = require("lodash");

class CardController {
  async generateReport(request, response) {
    let board = await trelloAdapter.getBoard();

    const { cards, actions, lists } = board;

    //Map created card with date
    const cardsWithFullDetails = cards.map((card) => {
      const matched = actions.find(
        (action) =>
          (action.type == "createCard" || action.type == "copyCard") &&
          action.data.card.id === card.id
      );
      if (matched) {
        return { ...card, ...matched };
      }
    });

    const objStatus = {
      Info: ["General Info", "Template"],
      Todo: ["Todo"],
      InProgress: ["In Progress", "Reviewing"],
      Done: ["Closed", "Classes", "Done"],
    };

    let updatedCard = cardsWithFullDetails;

    //Add updated list name to the card obj
    updatedCard = updatedCard.map((card) => {
      const matched = lists.find((list) => card.idList == list.id);
      if (matched) {
        card.updatedListName = matched.name;
        return { ...card };
      }
    });

    //Filter
    //list
    const status = request.query.status;
    const arrStatus = objStatus[status];
    if (status) {
      updatedCard = updatedCard.filter((card) =>
        arrStatus.includes(card.updatedListName)
      );
    }

    //label
    const label = request.query.label;
    if (label) {
      updatedCard = updatedCard.filter((card) => {
        const cardLabels = card.labels;
        const labelExist = cardLabels.some(
          (labelOfCard) => labelOfCard.name == label
        );
        if (labelExist) {
          return card;
        }
      });
    }

    //from Date
    const fromDate = request.query.from;
    if (fromDate) {
      updatedCard = updatedCard.filter((card) => card.date >= fromDate);
    }

    //to Date
    const toDate = request.query.to;
    if (toDate) {
      updatedCard = updatedCard.filter((card) => card.date <= toDate);
    }
    //End of filter

    //Group by list
    var sortedCard = _.groupBy(updatedCard, "updatedListName");

    //Group by month of card created
    for (let cardStatus in sortedCard) {
      sortedCard[cardStatus] = _.groupBy(sortedCard[cardStatus], (data) => {
        const createdDate = new Date(data.date);
        return createdDate.toLocaleString("default", { month: "long" });
      });
    }

    //Group by label
    let arrLabel = [];
    for (let cardStatus in sortedCard) {
      for (let cardMonth in sortedCard[cardStatus]) {
        //put label list into array
        var result = sortedCard[cardStatus][cardMonth]; //store array of obj created on certain month to variable
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
        var arrCard = sortedCard[cardStatus][cardMonth]; //array of cards under certain month
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

        sortedCard[cardStatus][cardMonth] = objCardByLabel;

        //to display number of cards created
        for (let labelList in sortedCard[cardStatus][cardMonth]) {
          sortedCard[cardStatus][cardMonth][labelList] = _.size(
            sortedCard[cardStatus][cardMonth][labelList]
          );
        }
      }
    }

    response.json(sortedCard);
  }
}


module.exports = new CardController();
