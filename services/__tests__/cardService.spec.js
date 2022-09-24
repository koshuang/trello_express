const { CardService } = require('../cardService');
const fakeCreateCardAction = require('./data/actions/createCardAction.json');
const fakeCopyCardAction = require('./data/actions/copyCardAction.json');
const fakeCard = require('./data/cards/card.json');
const fakeUpdatedCard = require('./data/cards/updatedCard.json');
const fakeList = require('./data/lists/list.json')

describe("CardService", () => {
  describe("appendCreatedDate()", () => {
    it("should append created date for createCard", async () => {
      const cardService = new CardService();
      const cards = [fakeCard];
      const actions = [fakeCreateCardAction];

      const updatedCards = cardService.appendCreatedDate(cards, actions);
      const card = updatedCards[0];

      expect(card.createdDate).toBe(fakeCreateCardAction.date);
    });

    it("should append created date for copyCard", async () => {
      fakeCopyCardAction.data.card.id = fakeCard.id;

      const cardService = new CardService();
      const cards = [fakeCard];
      const actions = [fakeCopyCardAction];

      const updatedCards = cardService.appendCreatedDate(cards, actions);
      const card = updatedCards[0];

      expect(card.createdDate).toBe(fakeCopyCardAction.date);
    });
  });

  describe("appendListName()", () => {
    it("should append list name", async () => {
      const cardService = new CardService();
      const fakeupdatedCards = [fakeUpdatedCard];
      const list = [fakeList]

      const updatedCards = cardService.appendListName(fakeupdatedCards, list);
      const card = updatedCards[0];

      expect(card.updatedListName).toBe(fakeList.name);
    });
  });
});
