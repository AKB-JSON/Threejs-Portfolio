import { meta, shopify, starbucks, tesla } from "../assets/images";
import {
    car,
    contact,
    css,
    estate,
    express,
    git,
    github,
    html,
    javascript,
    linkedin,
    mongodb,
    motion,
    mui,
    nextjs,
    nodejs,
    pricewise,
    react,
    redux,
    sass,
    snapgram,
    summiz,
    tailwindcss,
    threads,
    typescript
} from "../assets/icons";

export const skills = [
    {
        imageUrl: css,
        name: "CSS",
        type: "Frontend",
    },

    {
        imageUrl: git,
        name: "Git",
        type: "Version Control",
    },
    {
        imageUrl: github,
        name: "GitHub",
        type: "Version Control",
    },
    {
        imageUrl: html,
        name: "HTML",
        type: "Frontend",
    },
    {
        imageUrl: javascript,
        name: "JavaScript",
        type: "Frontend",
    },
   
    {
        imageUrl: mui,
        name: "Material-UI",
        type: "Frontend",
    },
    {
        imageUrl: nextjs,
        name: "Next.js",
        type: "Frontend",
    },
    {
        imageUrl: nodejs,
        name: "Node.js",
        type: "Backend",
    },
    {
        imageUrl: react,
        name: "React",
        type: "Frontend",
    }
];

export const experiences = [
    {
        title: "High School",
        company_name: "Centurion Public School, Paralakhemundi",
        icon: starbucks,
        iconBg: "#accbe1",
        date: "March 2017 - May 2018",
        points: [
           '73.4%' ,
        ],
    },
    {
        title: "Senior Secondary School",
        company_name: "St.Xavier International School, Bhubaneshwar",
        icon: tesla,
        iconBg: "#fbc3bc",
        date: "March 2018 - March 2020",
        points: [
          '81.20%' ,
        ],
    },
    {
        title: "Bachelor of Science in Zoology",
        company_name: "B.J.B Autonomous College, Bhubaneshwar",
        icon: shopify,
        iconBg: "#b7e4c7",
        date: "Jan 2020 - Jan 2023",
        points: [
           '70%' ,
        ],
    },
    {
        title: "Master of Computer Applications",
        company_name: "Kalinga Institute of Industrial Technology, Bhubaneshwar",
        icon: meta,
        iconBg: "#a2d2ff",
        date: "Jan 2023 - Present",
        points: [
            '70.29%'
        ],
    },
];

export const socialLinks = [
    {
        name: 'Contact',
        iconUrl: contact,
        link: '',
    },
    {
        name: 'GitHub',
        iconUrl: github,
        link: 'https://github.com/AKB-JSON',
    },
    {
        name: 'LinkedIn',
        iconUrl: linkedin,
        link: 'https://linkedin.com/in/asish-kumar-beniya',
    }
];

export const projects = [
    {
        iconUrl: pricewise,
        theme: 'btn-back-red',
        name: 'Three js Earth Globe',
        description: ' Developed a 3D Earth Globe using Three.js, a JavaScript library for creating 3D graphics on the web. Implemented interactive features such as zooming, rotating, and highlighting countries on the globe, and integrated data visualization with D3.js for displaying country-specific information.',
        link: 'https://github.com/AKB-JSON/Getting-started-with-three.js',
    },
    {
        iconUrl: threads,
        theme: 'btn-back-green',
        name: 'Full Stack Movie Review Application(2024)',
        description: 'Developed a full-stack movie review application using Java Spring Boot and React.js. Built RESTful APIs with MongoDB integration, implemented responsive UI components with Bootstrap, and created interactive features including movie trailers and user review system.Full Stack Movie Review Application(2024)',
        link: 'https://github.com/AKB-JSON/Full-Stack-Movie-Review-Application',
    },
    {
        iconUrl: car,
        theme: 'btn-back-blue',
        name: 'Health Appointment Booking App',
        description: 'Designed and built a mobile app for finding and comparing cars on the market, streamlining the car-buying process.',
        link: 'https://github.com/AKB-JSON/HealthManagementSystem',
    },
    {
        iconUrl: snapgram,
        theme: 'btn-back-pink',
        name: 'Generative AI for Code Optimization (Lisa)',
        description: 'Developed an AI-powered chatbot using OpenAIs GPT-3.5 Turbo API, offering programming assistance in JavaScript, React, and other languages, including code translation and optimization for improved readability and developer support. Updated the server by integrating the GROQ API for faster response times.',
        link: 'https://github.com/AKB-JSON/Chatbot',
    },
    {
        iconUrl: estate,
        theme: 'btn-back-black',
        name: 'React Native Real-Estate Application',
        description: 'Developed a web application for real estate listings, facilitating property searches and connecting buyers with sellers.',
        link: '',
    },
    {
        iconUrl: summiz,
        theme: 'btn-back-yellow',
        name: 'Drone Website',
        description: 'App that leverages AI to automatically generate concise & informative summaries from lengthy text content, or blogs.',
        link: 'https://github.com/AKB-JSON/DroneServiceFrontend',
    }
];