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

  describe("groupCards()", () => {
    it("should group cards by list, month and count labels", async () => {
      const cardService = new CardService();
      const fakeCard1 = {
        ...fakeUpdatedCard,
        updatedListName: "In Progress",
        labels: [{ name: 'A' }],
      };
      const fakeCard2 = {
        ...fakeUpdatedCard,
        id: "62d402c2a48edb10e252b577",
        updatedListName: "Done",
        labels: [{ name: 'A' }, { name: 'B' }],
      };
      const fakeCard3 = {
        ...fakeUpdatedCard,
        id: "62d402c2a48edb10e252b578",
        updatedListName: "Reviewing",
        labels: [{ name: 'B' }, { name: 'C' }],
      };
      const fakeCard4 = {
        ...fakeUpdatedCard,
        id: "62d402c2a48edb10e252b568",
        updatedListName: "Reviewing",
        labels: [{ name: 'B' }, { name: 'C' }, { name: 'D' }],
      };
      const fakeCard5 = {
        ...fakeUpdatedCard,
        id: "62d402c2a48edb10e252b558",
        updatedListName: "Reviewing",
        labels: [{ name: 'B' }, { name: 'C' }, { name: 'D' }],
        "createdDate": "2022-08-17T12:38:26.507Z"
      };
      const fakeCards = [
        fakeCard1,
        fakeCard2,
        fakeCard3,
        fakeCard4,
        fakeCard5,
      ];

      const updatedCards = cardService.groupCards(fakeCards);

      const expectedResult = {
        "Done": {
          July: {
            A: 1,
            B: 1,
            "No Label": 0
          }
        },
        "In Progress": {
          July: {
            A: 1,
            "No Label": 0
          }
        },
        "Reviewing": {
          August: {
            B: 1,
            C: 1,
            D: 1,
            "No Label": 0
          },
          July: {
            B: 2,
            C: 2,
            D: 1,
            "No Label": 0
          }
        },
      };

      expect(updatedCards).toEqual(expectedResult);
    });
  });
});
