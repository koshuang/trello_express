
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
}

module.exports = {
  CardService,
  cardService: new CardService(),
};
