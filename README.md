# hyperdag-protocol

Layer 1 Protocol Specification


## HyperDAG Ecosystem

```mermaid
graph TD
    classDef current fill:#2d3748,stroke:#63b3ed,stroke-width:4px,color:#fff;
    classDef default fill:#edf2f7,stroke:#4a5568,stroke-width:2px,color:#1a202c;

    Protocol["hyperdag-protocol<br/>(L1 Specification)"]
    Core["hyperdag-core<br/>(ZKP Pipeline)"]
    Symphony["trinity-symphony-shared<br/>(Agent Infrastructure)"]
    Repid["repid<br/>(Reputation Engine)"]
    Trustrepid["trustrepid<br/>(SDK & Client)"]

    Protocol --> Core
    Core --> Repid
    Repid --> Symphony
    Repid --> Trustrepid
    
    class Protocol current;
```


## Overview
This repository is part of the HyperDAG ecosystem.
Please see [CC's Specification Docs](/spec/SBT-MINTING-FLOW.md) (placeholder) for detailed architecture flows.

## Getting Started
Please see `.github/CONTRIBUTING.md` for setup.
