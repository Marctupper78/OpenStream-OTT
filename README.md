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

<img width="1366" height="768" alt="SS1" src="https://github.com/user-attachments/assets/9fe06467-a4b3-46aa-a8cc-ace37a167058" />
<img width="1366" height="768" alt="SS2" src="https://github.com/user-attachments/assets/de756d26-4545-47db-bf20-031d0ddeb154" />
<img width="1366" height="768" alt="SS12" src="https://github.com/user-attachments/assets/afdae8f5-35ab-49bc-9f76-8ae2e9b0cfbd" />
<img width="1366" height="768" alt="SS3" src="https://github.com/user-attachments/assets/1a318816-26fd-4459-85bc-76a980a06bfc" />
<img width="1366" height="768" alt="SS4" src="https://github.com/user-attachments/assets/38053696-7410-4329-a17c-96d4470361b9" />
<img width="1366" height="767" alt="SS5" src="https://github.com/user-attachments/assets/de47ced6-cde4-4b73-ae33-f5a5e38c284b" />
<img width="1366" height="768" alt="SS6" src="https://github.com/user-attachments/assets/df552961-d1d4-4993-bfc4-11fe529e5da8" />
<img width="1366" height="768" alt="SS7" src="https://github.com/user-attachments/assets/d0689fbb-9fe6-4d15-9124-0f518c8b78c3" />
<img width="1366" height="763" alt="SS8" src="https://github.com/user-attachments/assets/ff88d747-d0ac-4c9f-83b0-c6670e844670" />
<img width="1366" height="768" alt="SS9" src="https://github.com/user-attachments/assets/b3f7f798-7686-4806-829c-e10e165d4831" />
<img width="1366" height="759" alt="SS10" src="https://github.com/user-attachments/assets/1dee8c18-7c5d-4b07-a75f-f62d049166d1" />
<img width="1366" height="768" alt="SS11" src="https://github.com/user-attachments/assets/ad483cf7-3e88-4e8f-91bf-455e1e4fa1c9" />
<img width="1366" height="768" alt="SS13" src="https://github.com/user-attachments/assets/35a2ab78-6aad-41a4-93c8-7c659172ca1c" />
<img width="1366" height="768" alt="SS5" src="https://github.com/user-attachments/assets/140d8458-0ca9-4cbc-9120-14bdf0ef2e0f" />
<img width="1024" height="578" alt="SS12" src="https://github.com/user-attachments/assets/b6c85565-b947-4444-b62a-8084cfe54225" />
<img width="964" height="561" alt="SS13" src="https://github.com/user-attachments/assets/57f1a397-415d-4eba-914a-9aeb20fec286" />
<img width="971" height="578" alt="SS14" src="https://github.com/user-attachments/assets/4f68d9d0-dd7d-426e-8d99-1f36756807a4" />
<img width="972" height="566" alt="SS15" src="https://github.com/user-attachments/assets/d81d4382-f5b4-449a-a47c-a7f10c817646" />
<img width="973" height="560" alt="SS16" src="https://github.com/user-attachments/assets/150dc8af-88b5-4940-863a-4c82414cc0a4" />

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

