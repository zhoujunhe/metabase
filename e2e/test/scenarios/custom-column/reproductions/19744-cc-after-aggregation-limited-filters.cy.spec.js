import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import {
  restore,
  visitQuestionAdhoc,
  popover,
  visitDashboard,
  editDashboard,
  setFilter,
  addOrUpdateDashboardCard,
  modal,
} from "e2e/support/helpers";

const { PRODUCTS_ID, PRODUCTS } = SAMPLE_DATABASE;

const questionDetails = {
  dataset_query: {
    type: "query",
    query: {
      "source-query": {
        "source-table": PRODUCTS_ID,
        aggregation: [
          ["count"],
          ["sum", ["field", PRODUCTS.PRICE, null]],
          ["sum", ["field", PRODUCTS.RATING, null]],
        ],
        breakout: [["field", PRODUCTS.CATEGORY, null]],
      },
      expressions: { Math: ["+", 1, 1] },
    },
    database: SAMPLE_DB_ID,
  },
  display: "bar",
};

describe.skip("issue 19744", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();

    // For this specific repro, it's crucial to first visit the question in order to load the `results_metadata`...
    visitQuestionAdhoc(questionDetails);
    // ...and then to save it using the UI
    saveQuestion("19744");

    addQuestionToDashboardAndVisit();
  });

  it("custom column after aggregation shouldn't limit or change the behavior of dashboard filters (metabase#19744)", () => {
    editDashboard();

    setFilter("Time", "All Options");

    cy.findByTestId("dashcard-container").contains("Select…").click();
    popover().contains("Created At");
  });
});

function saveQuestion(name) {
  cy.intercept("POST", "/api/card").as("saveQuestion");

  cy.findByText("Save").click();
  cy.findByLabelText("Name").type(name);

  modal().button("Save").click();

  cy.findByText("Not now").click();

  cy.wait("@saveQuestion").then(({ response: { body } }) => {
    cy.wrap(body.id).as("questionId");
  });
}

function addQuestionToDashboardAndVisit() {
  cy.createDashboard().then(({ body: { id: dashboard_id } }) => {
    cy.get("@questionId").then(card_id => {
      addOrUpdateDashboardCard({
        card_id,
        dashboard_id,
        card: { size_x: 21, size_y: 10 },
      });
    });

    visitDashboard(dashboard_id);
  });
}
