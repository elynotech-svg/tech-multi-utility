export type DataWeaveLesson = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  inputMime: string;
  outputMime: string;
  payload: string;
  script: string;
  expectedOutput: string;
  concepts: string[];
};

export type DataWeaveSnippet = {
  id: string;
  title: string;
  category: "Core" | "Arrays" | "Objects" | "Strings" | "Dates" | "XML" | "Runtime";
  description: string;
  code: string;
};

export type DataWeaveSuggestion = {
  id: string;
  label: string;
  description: string;
  insertText: string;
};

export const dataWeaveLessons: DataWeaveLesson[] = [
  {
    id: "json-map-filter-default",
    title: "Map JSON arrays with defaults",
    level: "Beginner",
    description:
      "Filter active records, map fields to a target shape, concatenate strings, and provide safe fallback values with default.",
    inputMime: "application/json",
    outputMime: "application/json",
    payload: `{
  "customers": [
    {
      "id": "C-100",
      "firstName": "Ada",
      "lastName": "Lovelace",
      "active": true,
      "email": "ada@example.com",
      "orders": [
        { "id": "O-1", "price": 42.5 },
        { "id": "O-2", "price": 19.99 }
      ]
    },
    {
      "id": "C-200",
      "firstName": "Grace",
      "lastName": "Hopper",
      "active": false,
      "orders": []
    }
  ]
}`,
    script: `%dw 2.0
output application/json
---
payload.customers
  filter ($.active default false)
  map (customer) -> {
    id: customer.id,
    fullName: customer.firstName ++ " " ++ customer.lastName,
    email: customer.email default "missing@example.com",
    orderTotal: sum(customer.orders.price default [])
  }`,
    expectedOutput: `[
  {
    "id": "C-100",
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "orderTotal": 62.49
  }
]`,
    concepts: ["map", "filter", "default", "sum", "selectors"],
  },
  {
    id: "csv-to-json",
    title: "Transform CSV rows into JSON",
    level: "Beginner",
    description:
      "Convert CSV payload rows into typed JSON objects using as coercion and field renaming.",
    inputMime: "application/csv",
    outputMime: "application/json",
    payload: `sku,name,quantity,price
A-100,Adapter,4,12.50
B-200,Cable,2,7.25`,
    script: `%dw 2.0
input payload application/csv header=true
output application/json
---
payload map (item) -> {
  sku: item.sku,
  title: item.name,
  quantity: item.quantity as Number,
  unitPrice: item.price as Number,
  lineTotal: (item.quantity as Number) * (item.price as Number)
}`,
    expectedOutput: `[
  {
    "sku": "A-100",
    "title": "Adapter",
    "quantity": 4,
    "unitPrice": 12.5,
    "lineTotal": 50
  },
  {
    "sku": "B-200",
    "title": "Cable",
    "quantity": 2,
    "unitPrice": 7.25,
    "lineTotal": 14.5
  }
]`,
    concepts: ["input directive", "CSV", "type coercion", "map"],
  },
  {
    id: "update-operator",
    title: "Patch nested fields with update",
    level: "Intermediate",
    description:
      "Use the DataWeave update operator to change nested values without rebuilding the whole payload.",
    inputMime: "application/json",
    outputMime: "application/json",
    payload: `{
  "user": {
    "id": "U-100",
    "firstName": "Katherine",
    "lastName": "Johnson",
    "status": "ACTIVE"
  },
  "audit": {
    "source": "crm"
  }
}`,
    script: `%dw 2.0
output application/json
---
payload update {
  case user at .user -> user ++ {
    displayName: user.firstName ++ " " ++ user.lastName,
    status: lower(user.status)
  }
  case audit at .audit -> audit ++ {
    transformedBy: "dataweave-learn-lab"
  }
}`,
    expectedOutput: `{
  "user": {
    "id": "U-100",
    "firstName": "Katherine",
    "lastName": "Johnson",
    "status": "active",
    "displayName": "Katherine Johnson"
  },
  "audit": {
    "source": "crm",
    "transformedBy": "dataweave-learn-lab"
  }
}`,
    concepts: ["update", "case", "object merge", "lower"],
  },
  {
    id: "pattern-matching",
    title: "Normalize values with match",
    level: "Intermediate",
    description:
      "Centralize conditional logic with match expressions and helper functions.",
    inputMime: "application/json",
    outputMime: "application/json",
    payload: `[
  { "id": "T-1", "status": "NEW" },
  { "id": "T-2", "status": "IN_PROGRESS" },
  { "id": "T-3", "status": "DONE" }
]`,
    script: `%dw 2.0
output application/json

fun normalizeStatus(status) =
  status match {
    case "NEW" -> "open"
    case "IN_PROGRESS" -> "working"
    case "DONE" -> "closed"
    else -> "unknown"
  }
---
payload map (ticket) -> ticket ++ {
  normalizedStatus: normalizeStatus(ticket.status)
}`,
    expectedOutput: `[
  {
    "id": "T-1",
    "status": "NEW",
    "normalizedStatus": "open"
  },
  {
    "id": "T-2",
    "status": "IN_PROGRESS",
    "normalizedStatus": "working"
  },
  {
    "id": "T-3",
    "status": "DONE",
    "normalizedStatus": "closed"
  }
]`,
    concepts: ["match", "functions", "object merge", "map"],
  },
  {
    id: "group-and-pluck",
    title: "Group orders and pluck summaries",
    level: "Advanced",
    description:
      "Use groupBy and pluck to summarize records by key while keeping the output object clean.",
    inputMime: "application/json",
    outputMime: "application/json",
    payload: `[
  { "region": "NA", "amount": 120 },
  { "region": "EU", "amount": 80 },
  { "region": "NA", "amount": 35 }
]`,
    script: `%dw 2.0
output application/json
---
(payload groupBy $.region) pluck ((orders, region) -> {
  region: region,
  count: sizeOf(orders),
  total: sum(orders.amount)
}) orderBy $.region`,
    expectedOutput: `[
  {
    "region": "EU",
    "count": 1,
    "total": 80
  },
  {
    "region": "NA",
    "count": 2,
    "total": 155
  }
]`,
    concepts: ["groupBy", "pluck", "sum", "orderBy"],
  },
  {
    id: "xml-namespaces",
    title: "Read XML namespaces",
    level: "Advanced",
    description:
      "Declare a namespace and select XML elements into a JSON response.",
    inputMime: "application/xml",
    outputMime: "application/json",
    payload: `<orders xmlns:shop="https://example.com/shop">
  <shop:order id="O-100">
    <shop:customer>Ada</shop:customer>
    <shop:total>42.50</shop:total>
  </shop:order>
</orders>`,
    script: `%dw 2.0
output application/json
ns shop https://example.com/shop
---
payload.orders.*shop#order map (order) -> {
  id: order.@id,
  customer: order.shop#customer,
  total: order.shop#total as Number
}`,
    expectedOutput: `[
  {
    "id": "O-100",
    "customer": "Ada",
    "total": 42.5
  }
]`,
    concepts: ["XML", "namespace", "selectors", "type coercion"],
  },
];

export const dataWeaveSnippets: DataWeaveSnippet[] = [
  {
    id: "basic-header",
    title: "Basic JSON transform header",
    category: "Core",
    description: "Start a DataWeave 2.x transform that writes JSON output.",
    code: `%dw 2.0
output application/json
---
payload`,
  },
  {
    id: "safe-default",
    title: "Safe defaults",
    category: "Core",
    description: "Return a fallback when a field is missing or null.",
    code: `{
  name: payload.name default "Unknown",
  active: payload.active default false
}`,
  },
  {
    id: "map-filter",
    title: "Map and filter array items",
    category: "Arrays",
    description: "Keep matching records and project each item to a new shape.",
    code: `payload.items
  filter ($.enabled default false)
  map (item, index) -> {
    position: index + 1,
    id: item.id,
    label: upper(item.label)
  }`,
  },
  {
    id: "object-merge",
    title: "Merge objects",
    category: "Objects",
    description: "Combine the original object with derived fields.",
    code: `payload ++ {
  processedAt: now(),
  source: "api"
}`,
  },
  {
    id: "update-case",
    title: "Update nested object",
    category: "Objects",
    description: "Patch one nested path using update and case.",
    code: `payload update {
  case address at .customer.address -> address ++ {
    country: address.country default "US"
  }
}`,
  },
  {
    id: "pluck-values",
    title: "Pluck object values",
    category: "Objects",
    description: "Turn an object into an array with access to value and key.",
    code: `payload.prices pluck ((value, key) -> {
  sku: key,
  price: value as Number
})`,
  },
  {
    id: "string-cleanup",
    title: "Clean strings",
    category: "Strings",
    description: "Trim whitespace and normalize case.",
    code: `{
  email: lower(trim(payload.email)),
  displayName: capitalize(trim(payload.name))
}`,
  },
  {
    id: "date-format",
    title: "Format dates",
    category: "Dates",
    description: "Parse and render dates with an explicit format.",
    code: `(payload.createdAt as DateTime { format: "yyyy-MM-dd'T'HH:mm:ssXXX" })
  as String { format: "yyyy-MM-dd" }`,
  },
  {
    id: "xml-namespace",
    title: "Declare XML namespace",
    category: "XML",
    description: "Select namespaced XML nodes.",
    code: `ns order https://example.com/order
---
payload.order#orders.*order#order map (item) -> {
  id: item.@id,
  total: item.order#total as Number
}`,
  },
  {
    id: "try-runtime",
    title: "Try expression",
    category: "Runtime",
    description: "Return a recoverable result when an expression can fail.",
    code: `try(() -> payload.amount as Number) match {
  case success if success.success -> success.result
  else -> 0
}`,
  },
];

export const dataWeaveOutputTypes = [
  "application/json",
  "application/xml",
  "application/csv",
  "text/plain",
  "application/java",
];

export const dataWeaveSuggestions: DataWeaveSuggestion[] = [
  {
    id: "map-array",
    label: "map array",
    description: "Transform each array item.",
    insertText: `map (item, index) -> {
  id: item.id,
  position: index + 1
}`,
  },
  {
    id: "filter-array",
    label: "filter",
    description: "Keep records that match a condition.",
    insertText: `filter (item) -> item.active default false`,
  },
  {
    id: "default-value",
    label: "default",
    description: "Provide a safe fallback.",
    insertText: `payload.field default "fallback"`,
  },
  {
    id: "object-output",
    label: "object output",
    description: "Create a JSON object from payload fields.",
    insertText: `{
  id: payload.id,
  name: payload.name default "Unknown"
}`,
  },
  {
    id: "update-operator",
    label: "update",
    description: "Patch nested data without rebuilding everything.",
    insertText: `payload update {
  case item at .item -> item ++ {
    updated: true
  }
}`,
  },
  {
    id: "match-expression",
    label: "match",
    description: "Normalize values with pattern matching.",
    insertText: `payload.status match {
  case "NEW" -> "open"
  case "DONE" -> "closed"
  else -> "unknown"
}`,
  },
  {
    id: "group-by",
    label: "groupBy + pluck",
    description: "Summarize records by key.",
    insertText: `(payload groupBy $.region) pluck ((items, region) -> {
  region: region,
  count: sizeOf(items)
})`,
  },
  {
    id: "try-expression",
    label: "try",
    description: "Handle coercion errors safely.",
    insertText: `try(() -> payload.amount as Number) match {
  case success if success.success -> success.result
  else -> 0
}`,
  },
];
