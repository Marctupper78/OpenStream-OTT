# 🌍 OpenStream OTT 📺



> 🎥 OpenStream OTT Demonstration!

---

## Table of Contents

- [Introduction](#introduction)
- [Architecture Diagram](#architecture-diagram)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Application Workflow](#application-workflow)
- [Screenshots](#screenshots)
- [AI-Assisted Development](#ai-assisted-development)
- [Future Enhancements](#future-enhancements)
- [Resources](#resources)
- [Disclaimer](#disclaimer)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Introduction

**OpenStream OTT** is a modern OTT-style web application built using **React**, **TypeScript**, and **Vite** for discovering and streaming publicly available live TV channels from around the world.

The project focuses on delivering a clean, responsive, and lightweight streaming experience while demonstrating modern frontend development practices, reusable component architecture, cloud deployment, and AI-assisted software development.

Users can browse global television channels and stream **.m3u8** content directly in the browser without requiring registration, subscriptions, or downloads.

---

## Architecture Diagram

<img width="486" height="857" alt="Architecture Diagram drawio" src="https://github.com/user-attachments/assets/bbec4a09-a100-49d4-9e86-fbfefeef97d5" />

The application follows a component-based frontend architecture where reusable React components interact with a dedicated services layer to fetch and render publicly available IPTV streams, providing a responsive and maintainable user experience.

---

## Project Structure

      free-iptv-aggregator/
      │
      ├── .github/                 # GitHub configuration files (e.g., security policy)
      │   └── SECURITY.md
      │
      ├── frontend/                # Main React + Vite application
      │   ├── components/          # Reusable UI components
      │   ├── services/            # Stream & data handling logic
      │   ├── App.tsx              # Root React component
      │   ├── index.tsx            # Application entry point
      │   ├── index.html           # HTML template
      │   ├── package.json         # Dependencies & scripts
      │   ├── tsconfig.json        # TypeScript configuration
      │   └── vite.config.ts       # Vite configuration
      │
      ├── .gitignore               # Ignored files & directories
      ├── CODE_OF_CONDUCT.md       # Contributor Covenant Code of Conduct
      ├── LICENSE                  # MIT License
      └── README.md                # Project documentation

> The `frontend/` directory contains the complete web application, while root-level files manage repository standards, licensing, and security policies!

---

## Features

- Browse publicly available global live TV channels
- Stream .m3u8 channels directly in the browser
- Modern OTT-style responsive user interface
- Fast client-side rendering with React and Vite
- No login or subscription required
- Automatic deployment using GitHub and Vercel
- Lightweight component-based frontend architecture
- Cross-platform browser compatibility

---

## Tech Stack

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| TypeScript       | Programming Language    |
| React            | Frontend Framework      |
| Vite             | Build Tool              |
| HTML5            | Application Structure   |
| CSS3             | Styling                 |
| Node.js          | Runtime Environment     |
| npm              | Package Management      |
| Git              | Version Control         |
| GitHub           | Source Code Hosting     |
| Vercel           | Cloud Deployment        |
| Google AI Studio | AI-Assisted Development |
| Gemini           | AI Code Assistance      |

---

## Application Workflow

1️⃣ Launch the application.

2️⃣ Browse available live TV channels.

3️⃣ Select a channel.

4️⃣ Fetch the stream source.

5️⃣ Play the .m3u8 stream directly in the browser.

6️⃣ Continue browsing or switch to another channel.

7️⃣ Enjoy a responsive streaming experience without login or subscriptions.

---

## Screenshots



---

## AI-Assisted Development

This project was initially developed with the assistance of **Google AI Studio** and **Gemini** during a hackathon.

The AI-generated code has since been reviewed, refined, tested, and maintained to improve readability, maintainability, and overall code quality while preserving modern frontend development best practices.

---

## Future Enhancements

- AI-powered channel categorization
- Stream search and filtering
- Favorites & watch history
- Personalized recommendations
- Backend metadata service
- Live channel health monitoring
- Progressive Web App (PWA) support
- Performance optimization
- Accessibility improvements

---

## Resources

[![React | Documentation](https://img.shields.io/badge/React-Documentation-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/reference/react)
[![TypeScript | Documentation](https://img.shields.io/badge/TypeScript-Documentation-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/docs/)
[![Vite | Guide](https://img.shields.io/badge/Vite-Guide-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/guide/)
[![Vercel | Documentation](https://img.shields.io/badge/Vercel-Documentation-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/docs)
[![Google AI Studio | Documentation](https://img.shields.io/badge/Google%20AI%20Studio-Documentation-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/welcome)
[![MDN | HLS Streaming Guide](https://img.shields.io/badge/MDN-HLS%20Streaming%20Guide-000000?style=for-the-badge&logo=mdnwebdocs&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Streaming)

---

## Disclaimer

**OpenStream OTT** does not host, upload, or distribute any video content.

All streams are sourced from publicly available third-party providers. This project serves only as an interface for accessing publicly available streams and does not claim ownership of any linked content.

If you are a content owner and believe a stream should be removed, please open an issue in this repository with the relevant details.

---

## Contributing

Contributions are welcome. Before submitting changes, please review:

- [Contributing Guide](./Contributing.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./.github/SECURITY.md)

---

## License

This project is licensed under the **MIT License**.

See the **[LICENSE](./LICENSE)** file for details.

---

## Author

[**Sahil Sharma**](https://github.com/sahil-me)

![giphy](https://github.com/user-attachments/assets/e30d46e7-3a0a-4346-9fcf-4c543e6222d6)

Thank you for exploring this project. If you found this project helpful, consider giving it a ⭐ to support its continued development.

