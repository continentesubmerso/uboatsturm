# U-BOAT STURM

![U-BOAT STURM](./public/assets/titulo.png)

## Overview

**U-BOAT STURM** is a 2D submarine simulation game developed with [Phaser 3](https://phaser.io/) and [React](https://react.dev/). The player takes control of a U-boat, facing enemies and managing resources like battery and torpedoes.

## Features

-   **Submarine Control:**
    -   **Throttle:** Control the submarine's speed using a throttle lever.
    -   **Rudder:** Control the submarine's direction.
    -   **Keyboard:** Use the arrow keys to control the submarine.
-   **Operation Modes:**
    -   **Surface:** Faster movement and battery recharging.
    -   **Dive:** Slower movement and battery consumption.
-   **Combat:**
    -   **Torpedoes:** Launch torpedoes to sink enemy ships.
    -   **Enemies:** Face corvettes patrolling the area.
-   **Interface:**
    -   **Battery Meter:** Monitor the submarine's battery level.
    -   **Action Buttons:** Buttons to fire torpedoes and to dive/surface.

## Technologies

-   **Game Framework:** [Phaser 3](https://phaser.io/)
-   **UI Library:** [React](https://react.dev/)
-   **Language:** JavaScript
-   **Bundler:** [Vite](https://vitejs.dev/)

## How to Run

To run the project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/continentesubmerso/uboatsturm.git
    ```

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Start the development server:**

    ```bash
    npm run dev
    ```

4.  Open your browser and access the address provided by Vite (usually `http://localhost:5173`).

## Project Structure

```
/
├── public/             # Static files (images, CSS)
├── src/
│   ├── components/     # React components
│   ├── game/           # Phaser game logic
│   │   ├── entities/   # Game entities (submarine, enemies)
│   │   ├── scenes/     # Game scenes (menu, main game)
│   │   ├── systems/    # Management systems (levels, particles)
│   │   └── ui/         # Game UI elements
│   ├── App.jsx         # Main React component
│   └── main.jsx        # Application entry point
├── index.html          # Main HTML file
├── package.json        # Project dependencies and scripts
└── vite/               # Vite configurations
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
