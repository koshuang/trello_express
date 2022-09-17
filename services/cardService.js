
/**
 * Map created card with date
 *
 * @param {array} cards
 * @param {array} actions
 * @returns {array}
 */
class CardService {
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

module.exports = {
  CardService,
  cardService: new CardService(),
};
