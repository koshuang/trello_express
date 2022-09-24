const { CardService } = require("../cardService");
const fakeCreateCardAction = require("./data/actions/createCardAction.json");
const fakeCopyCardAction = require("./data/actions/copyCardAction.json");
const fakeCard = require("./data/cards/card.json");
const fakeUpdatedCard = require("./data/cards/updatedCard.json");
const fakeList = require("./data/lists/list.json");

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
      const list = [fakeList];

      const updatedCards = cardService.appendListName(fakeupdatedCards, list);
      const card = updatedCards[0];

      expect(card.updatedListName).toBe(fakeList.name);
    });
  });

  describe("filterByStatus()", () => {
    it("should filter cards by status", async () => {
      const cardService = new CardService();
      const fakeUpdatedCard1 = {
        ...fakeUpdatedCard,
        updatedListName: "In Progress",
      };
      const fakeUpdatedCard2 = {
        ...fakeUpdatedCard,
        id: "62d402c2a48edb10e252b577",
        updatedListName: "Done",
      };
      const fakeUpdatedCard3 = {
        ...fakeUpdatedCard,
        id: "62d402c2a48edb10e252b578",
        updatedListName: "Reviewing",
      };
      const fakeupdatedCards = [
        fakeUpdatedCard1,
        fakeUpdatedCard2,
        fakeUpdatedCard3,
      ];

      const updatedCards = cardService.filterByStatus(
        fakeupdatedCards,
        "InProgress"
      );

      expect(updatedCards.length).toBe(2);
      updatedCards.forEach((card) => {
        expect(["In Progress", "Reviewing"]).toContain(card.updatedListName);
      });
    });
  });
});
