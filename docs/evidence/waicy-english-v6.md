# English V6 Judge-Facing Retest

A structured set of short English requests reproduces the problems found in the November 28 review. The inputs are fictional. Each comparison checks the response and structured meal conditions before and after the repair. A live browser walkthrough also checks controls and preserves the complete final exchange.

The judge-facing update adds informal serving counts, prevents appliance names from entering the pantry, prioritizes ingredients already available, adds a stovetop eggs-and-tomatoes dish, and supports ordinary swap and explanation requests. The [English V6 model instructions](prompts/english-v6.txt) describe how the three roles affect ranking within the eligible options.

The first production browser run revealed that changing pantry text could move the equipment controls as soon as the field lost focus. The follow-up revision synchronizes pantry state while typing so the first click remains actionable. It also omits explicitly excluded pantry items from messages about missing recipe coverage.
