# DailyBid

![DailyBid Logo](https://alpha.daily-bid.com/assets/dailyBid_white-CqrDwDOM.svg)

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Contribution](#contribution)
- [License](#license)

## Project Description

**DailyBid** is a decentralized auction platform (dApp) built on the ICP Network. It allows users to participate in auctions transparently and securely using canisters and authentication via seed phrases. The project aims to revolutionize the auction process by eliminating intermediaries and ensuring greater trust between participants.

## Features

- Create and manage decentralized auctions.
- Participate in auctions with secure authentication.
- Intuitive interface for real-time bid tracking.

## Technologies Used

- **Frontend:** React, Vite, Chakra UI
- **Languages:** JavaScript, TypeScript
- **State Management:** Redux
- **Blockchain:** ICP Network

## Prerequisites

Ensure you have the following tools installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/)
- [dfx](https://smartcontracts.org/docs/developers-guide/cli-reference.html) (Internet Computer SDK)

## Installation

Follow these steps to set up the development environment:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/SDS-Timo/DailyBid.git

   ```

2. **Navigate to the project directory:**

   ```bash
   cd DailyBid

   ```

3. **Install dependencies:**

   ```bash
   npm install

   ```

4. **Start dfx:**

   ```bash
   dfx start

   ```

5. **Deploy the canister:**

   ```bash
   npm run deploy
   ```

## Usage

After installation, follow these steps to run the application:

1. **Start the frontend:**

   ```bash
   npm run dev

   ```

2. **Access the application:**

Open your browser and go to http://localhost:3993 to view the DailyBid interface.

## Contribution

Contributions are welcome! Follow these steps to contribute:

1. Fork this repository.
2. Create a branch for your feature (git checkout -b feature/new-feature).
3. Commit your changes (git commit -m 'Add new feature').
4. Push to the branch (git push origin feature/new-feature).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
