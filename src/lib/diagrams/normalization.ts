import type { TopicVisual } from "./types";

// 1) The anomaly hunt on one wide, un-normalized table.
// 2) The normalized schema as an ER diagram.
export const NORMALIZATION_VISUALS: TopicVisual[] = [
  {
    kind: "mermaid",
    title: "One wide table, three anomalies",
    caption:
      "Everything crammed into one Orders table. Each duplicated fact is a place where the data can silently go wrong.",
    chart: `flowchart TD
    T["Orders(orderId, custId, custCity,\nproductId, productName, qty)\n— one wide table"] --> U["UPDATE anomaly\ncustomer moves city →\nfix custCity in EVERY order row,\nmiss one and truth forks"]
    T --> I["INSERT anomaly\nnew product, never ordered →\nno row can hold it\n(no orderId to attach to)"]
    T --> D["DELETE anomaly\ndelete a customer's last order →\ntheir city vanishes with it"]
    U --> FIX["The cure: store every fact\nexactly ONCE →\nsplit the table"]
    I --> FIX
    D --> FIX
    FIX --> N["Customers · Orders ·\nOrderLines · Products"]

    classDef bad fill:#fbe7e6,stroke:#b3261e,color:#14181f;
    classDef table fill:#f4e9d2,stroke:#7a5a0a,color:#14181f;
    classDef good fill:#e0f3e9,stroke:#1a7f4e,color:#14181f;
    class T table;
    class U,I,D bad;
    class FIX,N good;`,
    notes: [
      {
        label: "The update anomaly is the root disease",
        text: "custCity is a fact about the CUSTOMER, stored once per ORDER. Duplicated facts drift: one UPDATE misses a row and the database now holds two 'truths'. Every normal form is a systematic hunt for columns stored in the wrong place.",
      },
      {
        label: "2NF vs 3NF on this exact table",
        text: "Key = (orderId, productId). productName depends on productId ALONE — part of the key → 2NF violation (partial dependency). custCity depends on custId, which is NOT a key at all → 3NF violation (transitive dependency: key → custId → custCity). Which normal form is broken depends on what the offending column depends on — that distinction is the exam question.",
      },
      {
        label: "Denormalizing back is allowed — deliberately",
        text: "A reporting table that pre-joins everything is fine when reads dominate and updates flow from the normalized source. The sin is accidental duplication; the trade-off, made consciously, is standard engineering.",
      },
    ],
  },
  {
    kind: "mermaid",
    title: "The normalized schema",
    caption:
      "Same information, four tables — every fact lives in exactly one place. Crow's feet read as 'one … many'.",
    chart: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_LINE : contains
    PRODUCT ||--o{ ORDER_LINE : "appears in"
    CUSTOMER {
        int id PK
        string name
        string city "moved here from Orders (3NF)"
    }
    ORDER {
        int id PK
        int custId FK
        date orderDate
    }
    ORDER_LINE {
        int orderId FK
        int productId FK
        int qty "the only fact owned by the pair"
    }
    PRODUCT {
        int id PK
        string name "moved here (2NF)"
        int price
    }`,
    notes: [
      {
        label: "Where each column went, and why",
        text: "custCity → CUSTOMER (it depends on custId: the 3NF transitive-dependency fix). productName → PRODUCT (it depends on half the composite key: the 2NF partial-dependency fix). qty stays in ORDER_LINE because it genuinely depends on the WHOLE key — which order AND which product.",
      },
      {
        label: "Reading the crow's feet",
        text: "CUSTOMER ||--o{ ORDER: one customer, zero-or-many orders. ORDER ||--|{ ORDER_LINE: one order, one-or-many lines. A customer moving city is now UPDATE one row in CUSTOMER — the anomaly is structurally gone, not just less likely.",
      },
      {
        label: "Normalization ≠ transactions",
        text: "The schema fixes redundancy; it does nothing about two clerks editing the same row at once. That's ACID's job — atomic all-or-nothing groups, isolated from concurrent readers. The two topics pair on the exam because together they cover 'data that stays correct'.",
      },
    ],
  },
];
