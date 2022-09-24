
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
}

module.exports = {
  CardService,
  cardService: new CardService(),
};
