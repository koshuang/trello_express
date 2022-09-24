//Declaration
const _ = require("lodash");
const { trelloAdapter } = require("../adapters/trelloAdapter");
const { cardService } = require("../services/cardService");
const { each } = require("lodash");

class CardController {
  async generateReport(request, response) {
    const { from, to, status, label } = request.query;

    const board = await trelloAdapter.getBoard();

    const { cards, actions, lists } = board;

    let updatedCards = cardService.appendDetailInfo(cards, actions, lists);

    updatedCards = this.filterCards(updatedCards, status, label, from, to);

    let groupedCardMap = cardService.groupCards(updatedCards);

    response.json(groupedCardMap);
  }

  filterCards(updatedCards, status, label, from, to) {
    updatedCards = cardService.filterByStatus(updatedCards, status);

    updatedCards = this.filterByLabel(updatedCards, label);

    updatedCards = this.filterByDateRange(updatedCards, from, to);
    return updatedCards;
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

  appendListName(updatedCards, lists) {
    return updatedCards.map((card) => {
      const matched = lists.find((list) => card.idList == list.id);

      return {
        updatedListName: matched?.name,
        ...card,
      };
    });
  }
}

module.exports = new CardController();
