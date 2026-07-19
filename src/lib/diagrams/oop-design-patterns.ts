import type { TopicVisual } from "./types";

// 1) Observer, concretely: the stock-ticker scenario from the content.
//    The whole pattern is visible in the arrow directions — the subject
//    points at the INTERFACE, the widgets point at the interface, and
//    nobody points at a concrete widget.
// 2) Strategy + Factory composed in the checkout scenario: one seam for
//    "which algorithm runs" (the interface) and one for "who builds it"
//    (the factory). Checkout touches only the interface.
export const OOP_DESIGN_PATTERNS_VISUALS: TopicVisual[] = [
  {
    kind: "mermaid",
    title: "Observer — the stock ticker and its widgets",
    caption:
      "Read the arrows: StockTicker holds a list of the Observer INTERFACE; the widgets implement it. No arrow ever points from the ticker to a concrete widget — that missing arrow is the pattern.",
    chart: `classDiagram
    class StockTicker {
        -observers List~Observer~
        +subscribe(o)
        +unsubscribe(o)
        +notifyAll()
    }
    class Observer {
        <<interface>>
        +update(price)
    }
    class ChartWidget {
        +update(price)
    }
    class AlertWidget {
        +update(price)
    }
    class TableWidget {
        +update(price)
    }
    StockTicker o-- "0..*" Observer : keeps a list of
    Observer <|.. ChartWidget
    Observer <|.. AlertWidget
    Observer <|.. TableWidget`,
    notes: [
      {
        label: "Who knows about whom — the arrows ARE the pattern",
        text: "StockTicker knows only the Observer interface: it can subscribe, unsubscribe and notifyAll without ever naming ChartWidget. The widgets know the ticker exists (they subscribe to it), but the dependency back is to the abstraction. Add a fourth widget tomorrow and the ticker's code does not change by one line — that is the decoupling the pattern buys, and it lives entirely in the direction of these arrows.",
      },
      {
        label: "Push vs pull — what does update() carry?",
        text: "Here the ticker pushes the price into update(price): simple for subscribers, but the subject must guess what everyone needs and may ship data most observers ignore. The pull variant sends just update() and lets each widget query the ticker for exactly what it wants — more flexible, but chattier and it couples observers to the subject's getters. Neither is 'correct'; know the trade-off.",
      },
      {
        label: "Exam tell",
        text: "The phrase to hunt for is 'many parts must react when something changes, without the source knowing which parts exist'. Dashboards updating on a price change, listeners on an event, cells recalculating in a spreadsheet — all Observer. If the scenario is about SWAPPING one algorithm rather than NOTIFYING many dependents, it is Strategy, not Observer.",
      },
    ],
  },
  {
    kind: "mermaid",
    title: "Strategy + Factory — the checkout that never says 'new'",
    caption:
      "Checkout depends only on the PaymentGateway interface (Strategy). The only place that knows the concrete classes is GatewayFactory.create(name) (Factory). Two seams, composed.",
    chart: `classDiagram
    class PaymentGateway {
        <<interface>>
        +charge(amount)
    }
    class StripeGateway {
        +charge(amount)
    }
    class PaypalGateway {
        +charge(amount)
    }
    class AdyenGateway {
        +charge(amount)
    }
    class GatewayFactory {
        +create(name) PaymentGateway
    }
    class Checkout {
        -gateway PaymentGateway
        +placeOrder(amount)
    }
    PaymentGateway <|.. StripeGateway
    PaymentGateway <|.. PaypalGateway
    PaymentGateway <|.. AdyenGateway
    Checkout --> PaymentGateway : depends ONLY on
    Checkout ..> GatewayFactory : asks for a gateway
    GatewayFactory ..> StripeGateway : creates
    GatewayFactory ..> PaypalGateway : creates
    GatewayFactory ..> AdyenGateway : creates`,
    notes: [
      {
        label: "Depend on the interface, never the concrete class",
        text: "Checkout's field is typed PaymentGateway, so it can charge through Stripe, PayPal or Adyen without knowing which one it holds. That buys three things at once: adding Adyen touches zero call sites, tests can hand Checkout a fake gateway, and the config string that picks the provider changes behaviour at runtime with no recompile of Checkout. Every 'new StripeGateway()' scattered through business code destroys all three.",
      },
      {
        label: "Factory vs Strategy — creation seam vs algorithm seam",
        text: "They answer different questions and compose rather than compete. Strategy is the PaymentGateway interface itself: WHICH charging algorithm runs is swappable behind one method. Factory is create(name): WHERE the concrete object gets built is centralised in one switch. Here the factory picks the strategy — one file knows the concrete classes, everything else stays abstract.",
      },
      {
        label: "Exam tell for each",
        text: "Strategy: 'the algorithm/behaviour must be interchangeable at runtime behind one call' — shipping price by carrier, movement modes, payment providers. Factory: 'callers need an object but must not know (or repeat) which concrete class gets built' — usually flagged by a config value or a switch on a type string. If the question shows 40 call sites doing new X() and a new variant arriving, the answer is Factory; if it shows one caller flipping between behaviours, it is Strategy.",
      },
    ],
  },
];
