<div align="center">
<a id="readme-top"></a>
<!-- Header banner -->

---

<p align="center">
    <img src="https://raw.githubusercontent.com/Club-PARD/00_FE/refs/heads/main/public/logo.svg" width="45%"/>

</p>

<br/>

청년의 목소리를 담아낼 그릇 <br />청년 대표성 회복 플랫폼 <b>mora</b>

<br/>
</div>

---

# ✱ Context

- [Intro](#Intro)
- [Features](#features)
- [System Design and Documentation](#system-design-and-documentation)
- [Tech Stack](#tech-stack)
- [Acknowledgements](#acknowledgements)

<div>

# Intro

### 서비스명: Mora

#### 대한민국 청년들이 정책 참여에 뛰어들고, 자신의 목소리를 실제 제도권 참여로 연결하도록 돕는 웹 서비스 입니다.

> ❗ **Problem Definition:** 정치 및 정책에 참여하는 것이 어렵고, 피드백이 없어 무력감을 느낍니다.

### mora는 이것을 해결하고자 합니다

| As-is                                                          | To-be                                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 행정/정책 용어가 어렵고, 공부하는 비용이 너무 큽니다.          | AI 요약으로 핵심 쟁점을 빠르게 파악하게 도와줍니다.                           |
| 공식 청원 사이트는 복잡하고 사용자 친화적이지 않습니다.        | 원하는 청원에서 공식 청원(국민동의청원/청원24)로 가는 최단 경로를 제공합니다. |
| 참여해도 처리 과정/결과를 추적하기 어려워 효능감이 사라집니다. | 북마크/알림으로 진행상황과 처리결과를 끝까지 추적할 수 있게 합니다.           |

# Features

### 핵심 기능


### 1. 정보 경량화: 청원 분석 요약

> 청원 원문(감정적/편향적 표현 포함)을 그대로 두지 않고, 20대가 이해하기 쉬운 형태로 재구성합니다.

<p align="center">
  <img 
    src="https://raw.githubusercontent.com/Club-PARD/00_FE/main/public/image1.png"
    alt="청원 분석 요약 화면"
    width="80%"
  />
</p>



### 2. 참여의 One-Stop: 청원 브릿지

> 사용자가 청원을 읽는데서 멈추는 것이 아니라, 직접 참여할 수 있도록 공식 청원(국민동의청원/청원24)로 바로 이동할 수 있는 동선 제공을 제공합니다.

<p align="center">
  <img 
    src="https://raw.githubusercontent.com/Club-PARD/00_FE/main/public/image2.png"
    alt="청원 브릿지 화면"
    width="80%"
  />
</p>



### 3. 효능감 회복: 이슈 트래커(북마크/알림)

> 사용자가 관심을 가진 안건을 끝까지 확인함으로써, 사용자가 정책 변화에 힘을 쓸 수 있다는 것을 느끼도록 돕습니다.

<p align="center">
  <img 
    src="https://raw.githubusercontent.com/Club-PARD/00_FE/main/public/email.png"
    alt="이슈 트래커"
    width="80%"
  />
</p>



### 4. 데이터 엔진: 성향 테스트 및 성향 기반 댓글

> 간단한 성향 테스트를 통해 사용자에게 유형을 부여하고, 사용자들의 댓글이 단순한 소음이 아닌, 하나의 데이터가 될 수 있도록 합니다.

<p align="center">
  <img 
    src="https://raw.githubusercontent.com/Club-PARD/00_FE/main/public/image4.png"
    alt="댓글"
    width="80%"
  />
</p>



### 5. 청원 탐색 UX: 카드뉴스/정렬/필터/검색

> 주간 TOP 청원 배너와 카드뉴스를 제공하여, 사용자들이 현재 이슈가 되고 있는 청원에 빠르게 접근할 수 있도록 합니다.

<p align="center">
  <img 
    src="https://raw.githubusercontent.com/Club-PARD/00_FE/main/public/image5.png"
    alt="카드 뉴스"
    width="80%"
  />
</p>


# System Design and Documentation

### ERD

<img 
  src="https://raw.githubusercontent.com/Club-PARD/00_FE/main/public/ERD.png"
  alt="ERD"
  width="45%"
/>

---

# Tech Stack

## Built With

### Frontend

<p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zustand-443E38?style=flat&logo=zustand&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS%20Modules-000000?style=flat&logo=cssmodules&logoColor=white"/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white"/>
  <img src="https://img.shields.io/badge/NextAuth-000000?style=flat&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Swiper-6332F6?style=flat&logo=swiper&logoColor=white"/>
</p>


### Backend
<p>
  <img src="https://img.shields.io/badge/Java-17-007396?style=flat&logo=java&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.1-6DB33F?style=flat&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=flat&logo=springsecurity&logoColor=white"/>
  <img src="https://img.shields.io/badge/OAuth2-000000?style=flat&logo=auth0&logoColor=white"/>
  <img src="https://img.shields.io/badge/JPA-59666C?style=flat&logo=hibernate&logoColor=white"/>
  <img src="https://img.shields.io/badge/OpenFeign-000000?style=flat&logo=apache&logoColor=white"/>
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Selenium-43B02A?style=flat&logo=selenium&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Async-6DB33F?style=flat&logo=spring&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Mail-6DB33F?style=flat&logo=gmail&logoColor=white"/>
</p>

#### Backend Responsibilities
- Spring @Async 기반 비동기 처리
- Selenium(Chrome Driver)을 활용한 데이터 크롤링
- Spring Boot Mail을 통한 이메일 알림

#### Database
<p>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white"/>
</p>

#### Public Data
<p>
  <img src="https://img.shields.io/badge/Public%20API-국회%20정보공개%20포털-003764?style=flat"/>
</p>

#### AI / LLM
<p>
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o%20mini-412991?style=flat&logo=openai&logoColor=white"/>
</p>

#### Server / Infrastructure
<p>
  <img src="https://img.shields.io/badge/AWS%20EC2-FF9900?style=flat&logo=amazonaws&logoColor=white"/>
  <img src="https://img.shields.io/badge/Ubuntu-E95420?style=flat&logo=ubuntu&logoColor=white"/>
</p>

### Cooperate Tool
<p>
  <img src="https://img.shields.io/badge/Figma-F24E1E?style=flat&logo=Figma&logoColor=white"/>
  <img src="https://img.shields.io/badge/Slack-4A154B?style=flat&logo=slack&logoColor=white"/>
  <img src="https://img.shields.io/badge/Notion-000000?style=flat&logo=notion&logoColor=white"/>
</p>
<br>

# Acknowledgements

> **This was made possible by** </br>
> <a href="https://we-pard.com/" style="display:flex;flex-direction:column;">
> <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExampoeG5sZDN4ZHhoNWRpMXRsdDZlcjhzczk4eTE0d2dyajB6YWJjeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SwO3hAK7Jt5nYD0L1z/giphy.gif" width="520" height="140" />
> </a>

---

### License

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
