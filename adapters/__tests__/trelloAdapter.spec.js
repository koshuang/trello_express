const { TrelloAdaptor } = require('../trelloAdapter');

describe("TrelloAdaptor", () => {
  test("getBoard", async () => {
    const fakeClient = {
      async get(url) {},
    };

    const spy = jest.spyOn(fakeClient, 'get');

    const trelloAdaptor = new TrelloAdaptor({
        key: 'test_key',
        token: 'test_token',
        boardId: 1,
      }, fakeClient);

    const board = await trelloAdaptor.getBoard();

    const expectedUrl = 'https://api.trello.com/1/boards/1?key=test_key&token=test_token&fields=all&actions=all&action_fields=all&actions_limit=1000&cards=all&card_fields=all&card_attachments=true&labels=all&lists=all&list_fields=all&members=all&member_fields=all&checklists=all&checklist_fields=all&organization=false';
    expect(spy).toHaveBeenCalledWith(expectedUrl);
  });
});
