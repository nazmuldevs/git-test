# Task 4: Critical Evaluation

**Word count: ~750 words**

## a) Back-end technology and front-end vs back-end

Front-end code is everything that runs inside the visitor's own browser. This project is built with HTML, CSS and JavaScript, and all of it counts as front-end. The browser reads these files and draws the page, and any logic, like the cart or the star ratings, runs on the visitor's machine using `localStorage`.

Back-end code runs on a server the business controls, not the visitor's computer. To make Bean Boutique a real working shop, it would need a server (Node.js, PHP or Python), a database (such as MySQL) for products, orders, accounts and bookings, and a payment gateway such as Stripe. It would also need an email service, since the registration form currently just opens a `mailto:` link instead of sending mail from a server.

The clearest example is the cart. Right now it lives in the browser's `localStorage`, so it only exists on one device. A real back-end would save it against a customer account, so it would follow them everywhere and could actually be charged.

## b) Evaluating the three plugins

**Social feed widget.** A grid of sample posts styled like Instagram, built with CSS and emoji rather than a real embed. It shows community engagement, fitting the shop's "warmth and community" theme. It does not pull in real posts, so a live version should use the real Instagram Graph API instead.

**Interactive map.** Rather than embedding Google Maps, this is a hand-drawn SVG with a clickable pin showing the shop's address and hours. A real map needs an API key and sends requests to a third party, which the build environment could not reach. It shows the location well but gives no real directions, so production should use a real map embed.

**Cookie and privacy banner.** This answers the "security feature to protect customer data" requirement directly. It tells visitors what is stored on their device and lets them choose "Accept All" or "Essential Only". This fits well because everything the site stores does stay in the browser. Once real payments exist, the banner alone would not be enough. The site would also need HTTPS, a secured server, and PCI DSS compliant payment handling.

## c) Version control and GitHub

Version control keeps a history of every change made to a project's files. Instead of saving files as "final" or "final2", each change is saved as a "commit" with a message explaining what changed. Old versions are never lost, and mistakes can always be undone.

GitHub hosts this history online. This project was built on its own branch, separate from the main branch, so new features could be tested without risking the working version. Each commit explains what was added, building a clear record of how the site grew into six pages. If Bean Boutique hired more developers, GitHub would let them work on different features at once without overwriting each other's work.

## d) Front-end frameworks and Bootstrap

A front-end framework is a ready-made set of CSS and JavaScript that developers reuse instead of writing everything from scratch. Bootstrap is a well known example, with ready-made buttons, navigation bars and grids. The main advantages are speed, consistency, and code already tested across browsers.

Bootstrap was not used here, partly because the assignment asked for hand-written HTML and CSS, but also because it has a recognisable look that takes effort to override. This site relies on a custom colour palette and hand-drawn illustrations for its own identity, and building by hand gave more control than Bootstrap's defaults would. For a business that needs a site built fast, Bootstrap is still a sensible choice.

## e) Reflection, value and recommendations

The strongest part of this project is that it behaves like a working shop, not static pictures. A visitor can add coffee to a cart from three pages and see it saved, rate a coffee and see it lock in, search the catalogue live while typing, and register for an event with a pre-filled email. That JavaScript and `localStorage` layer added the most value, turning the design into something a reviewer can use and test.

The clearest next steps are a real back-end and database so orders and accounts persist, real licensed photography in place of the illustrations, a real payment gateway, and real map and social embeds once hosted with normal internet access. These are the right priorities because the site already proves the idea and the user experience work. What is missing is real data and money handling, only possible with a back-end.
