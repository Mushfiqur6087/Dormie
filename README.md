# Dormie - Hall Management System

Dormie is a comprehensive Hall Management System designed to streamline and automate various administrative tasks for dormitory/hall environments. The project features a modern frontend built with Next.js, a robust backend powered by Spring Boot, and utilizes a relational database managed via Spring Data JPA. The entire application is containerized using Docker for easy deployment and scalability.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running with Docker](#running-with-docker)
  - [Manual Setup](#manual-setup)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Student Registration & Management
- Room Allocation & Tracking
- Fee Collection & Dues Tracking
- Complain Handling
- Lost & Found
- Mess-Manager Role
- Role-based Access Control
- Responsive UI for Admins,Provost & Students
- RESTful APIs for integration

## Tech Stack

- Frontend: [Next.js](https://nextjs.org/) (React)
- Backend: [Spring Boot](https://spring.io/projects/spring-boot)
- Database: [Spring Data JPA](https://spring.io/projects/spring-data-jpa) (e.g., MySQL/PostgreSQL)
- Containerization: [Docker](https://www.docker.com/)

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/)
- (Optional for manual setup)
  - Node.js (Latest LTS)
  - Java 17+
  - Maven

### Running with Docker

1. Clone the Repository:

        git clone https://github.com/Mushfiqur6087/Dormie.git
    cd Dormie
    

2. Start the Application:

        docker compose -f docker-compose.dev.yml up --build
    

3. Access the Application:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:8080/api](http://localhost:8080/api) (default)

4. Stop the Application:

        docker compose -f docker-compose.dev.yml down
    
---


##Youtube Video Links:
https://youtu.be/9zVMjez8Azk
https://youtu.be/aKmEw4mosWI


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by the Dormie team
