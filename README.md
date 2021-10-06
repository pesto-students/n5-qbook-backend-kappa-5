# Qbook (QR Code Based Appointment System)

QBook is designed for out-patient(OP) consultation at clinics. The app automates the queuing process between the doctor and the patients who are waiting for consultation. 
During the tough times of COVID-19 pandemic, it's essential to maintain social distance and high safety standards. Inorder to overcome this challenge, we have designed an app where a patient can scan the QR code and book an appointment without the need to touch anything.

Easy and hassle free booking system is provided where the user can easily authenticate using the mobile number with OTP verification and pay the required consultation fees online.The queue number will be displayed immediately in the confirmation page once the booking has been completed. 


## Table of Contents
- [Website](#website)
- [Getting Started](#getting-started)
	- [Prerequisites](#prerequisites)
	- [Installation](#installation)
- [Tech Stack](#tech-stack)
	- [3rd Party Integration](#3rd-party-integration)
- [Source Code](#source-code-repo)
- [Resources](#resources)
- [Developers](#developers)
- [UI Screens](#ui-screens)


## website

Project Website: https://qbooks.in

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

npm install npm@latest -g

### Installation

Clone the repo
- git clone https://github.com/pesto-students/n5-qbook-frontend-kappa-5/

Install NPM packages 
- npm install

Run the frontend app
- npm run start

Run the backend app
sails lift

## Tech Stack

- NextJS
- Redux
- Tailwind CSS
- Mongo DB
- NodeJS

## 3rd Party Integration

- Razor Pay
- Vercel
- Firebase
- Twillio
- AWS S3

## Source Code Repo

- Front End - https://github.com/pesto-students/n5-qbook-frontend-kappa-5/
- Back End  - https://github.com/pesto-students/n5-qbook-backend-kappa-5

## Resources

- PRD
- UX Wireframes
- High Level Design

## Developers

- Gaurav Tayal
- Mounika D
- Mohit Niwadunge

## UI Screens

### Work Flow for Doctor

The login page for the doctor where he can track the real time appointments. 

![image](https://user-images.githubusercontent.com/5499396/136135935-f1de749f-b205-44b9-b0ca-fd499604fb58.png)


The appointments tab where all the appointments are displayed. It includes the below features.
	- Search the appointments by Name or phone number
	- Settings where the doctor can toggle their availability.	
	- Number of appointments
	
![image](https://user-images.githubusercontent.com/5499396/136136295-cf0f1426-f630-4680-8e82-a51fd822b817.png)
![image](https://user-images.githubusercontent.com/5499396/136138188-277863e0-5c61-44a4-b3ec-69828307ad9b.png)

On clicking the start button next to the appointments, the consultation for that patient can be started. The doctor can enter the diagnosis and the prescription and on clicking the submit button, the current consultation is closed for that patient doctor is redirected to the appointments page so that they can proceed with the next appointments.
![image](https://user-images.githubusercontent.com/5499396/136138314-2316e70d-cf21-408e-a1ac-eb6e4e0af357.png)


The appointments history tab where the history of the consultations are displayed. It includes the below features.
	- Search the appointments by Name or phone number
	- Filter the appointments by date. 
	- Send the Prescription action -> By clicking on this action, the prescription is sent to the mobile number of the patient via SMS.
	- View Prescription action -> By clicking on this action, the prescription can be edited and saved.

![image](https://user-images.githubusercontent.com/5499396/136136682-6723d1d4-de3e-4606-91d2-750d79844620.png)

The setting tab allows the doctor to configure their personal details and the available timings so that patients can book the appointments.

![image](https://user-images.githubusercontent.com/5499396/136136988-58972632-b311-4d4b-95cb-3f64d85d5505.png)

The QR code tab provides a QR code to the patients to easily scan and book their appointments.

![image](https://user-images.githubusercontent.com/5499396/136137099-559b4a0f-57b2-49b0-921b-26c2b4a3eb11.png)

The reports tab provides a line graph and bar graph for tracking the finances and the appointments.

![image](https://user-images.githubusercontent.com/5499396/136137216-5b2b7753-9d41-4c76-8f6c-d7678039e7fb.png)

The support tab allows to send any query to the doctor. An automated email is triggerred when the send button is clicked.

![image](https://user-images.githubusercontent.com/5499396/136137312-75f44a4e-5400-4e0b-9801-ca936771b52d.png)

### Work Flow for Patient

- Scan the QR code 
- The below form will be opened where the patient can fill in their details and authenticate with phone number via OTP verification and click on Book Appointment.
![image](https://user-images.githubusercontent.com/5499396/136137684-1fec903d-3801-482c-96c4-6c00b7dbeefa.png)
- After validation, the patient can select to pay via cash or online. On selecting the online payment mode, the patient is redirected to razor pay screen where the patient can fill in the payment details and complete their transaction.
- Once the appointment is confirmed, the patient is redirected to the confirmation page where details like the queue number and the expected waiting time will be displayed.

![image](https://user-images.githubusercontent.com/5499396/136137854-4e21ed90-2570-4659-bf81-08c7cfce2ba0.png)


