# Factory Method Pattern Examples

## Generating the README

To regenerate this README with updated directory structures:

```bash
npx tsx generate-readme.ts
```

This script uses `tree-node-cli` to generate clean directory trees.

## Factory Method 1: Simple Notification System

Demonstrates the Factory Method pattern with different notification types (Email, SMS, Push, Slack, Delayed Email).

### How to Run

```bash
npx tsx src/factory_method_1/index.ts
```

### Directory Structure

```
1_factory_method
├── _example.ts
├── concrete-classes.ts
├── factory.ts
├── index.ts
└── interfaces.ts
```

## Factory Method 2: Event Storage with Multiple Databases

Shows the pattern for creating database connections and storing events in SQLite, JSON, PostgreSQL, and MongoDB.

### How to Run

```bash
npx tsx src/factory_method_2/index.ts
```

### Directory Structure

```
2_factory_method
├── database
│   ├── connections
│   │   ├── jsonConnection.test.ts
│   │   ├── jsonConnection.ts
│   │   ├── mongoConnection.test.ts
│   │   ├── mongoConnection.ts
│   │   ├── pgConnection.test.ts
│   │   ├── pgConnection.ts
│   │   ├── sqliteConnection.test.ts
│   │   └── sqliteConnection.ts
│   ├── factories
│   │   ├── jsonFactory.ts
│   │   ├── mongoFactory.ts
│   │   ├── pgFactory.ts
│   │   └── sqliteFactory.ts
│   ├── index.ts
│   └── interfaces.ts
├── eventFactory.test.ts
├── eventFactory.ts
├── events
│   ├── event.test.ts
│   ├── event.ts
│   ├── testEvent.test.ts
│   ├── testEvent.ts
│   ├── webserviceEvent.test.ts
│   ├── webserviceEvent.ts
│   ├── workflowEvent.test.ts
│   └── workflowEvent.ts
├── index.ts
└── sampleEvents.json
```

