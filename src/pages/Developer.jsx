import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/Developer.css";
import { GithubFilled, LinkedinFilled } from "@ant-design/icons";

const slidesData = [
  {
    name: "Adarsh S",
    position: "Full Stack Developer",
    image: "/img/adarsh.jpg",
    linkedin: "https://www.linkedin.com/in/ada-rsh-s/",
    github: "https://github.com/ada-rsh-s/",
  },
  {
    name: "Abhiram V",
    position: "Back-End Developer",
    image: "/img/abhiram.jpg",
    linkedin: "#",
    github: "#",
  },
  {
    name: "Alan Jose Santo",
    position: "UI/UX Developer",
    image: "/img/alan.jpg",
    linkedin: "https://linkedin.com/in/alan-jose-santo",
    github: "https://github.com/realityaudiostudio",
  },
  {
    name: "Christopher J Neelankavil",
    position: "Back-End Developer",
    image: "/img/christu.jpg",
    linkedin:
      "https://www.linkedin.com/in/christopher-j-neelankavil-748142281/",
    github: "https://github.com/christopherjneelankavil",
  },
  {
    name: "Abid Ahammed S H",
    position: "Front-End Developer",
    image: "/img/abid.jpg",
    linkedin: "#",
    github: "#",
  },
  {
    name: "Aldin K Immanuel",
    position: "Front-End Developer",
    image: "/img/aldin.jpg",
    linkedin: "#",
    github: "#",
  },
];

const Developer = () => {
  const swiperRef = useRef(null); 

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.update(); 
      swiperRef.current.slideToLoop(0);
      
    }
  }, []);

  return (
    <main>
      <div className="container">
        <h2 className="developer-heading">MASTERS OF THE BUILD</h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          loop={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          centeredSlides={true}
          slidesPerView="auto"
          speed={800}
          slideToClickedSlide={true}
          pagination={{ clickable: true }}
          initialSlide={0}
          breakpoints={{
            320: { spaceBetween: 40 },
            650: { spaceBetween: 30 },
            1000: { spaceBetween: 20 },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            swiper.update(); // Update on init
          }}
          onInit={(swiper) => {
            swiper.slideToLoop(0); // Ensure centering on init
          }}
        >
          {slidesData.map((slide, index) => (
            <SwiperSlide key={index}>
              <img src={slide.image} alt={slide.name} />
              <div className="title">
                <h1>{slide.name}</h1>
              </div>
              <div className="content">
                <div className="text-box">
                  <p>{slide.position}</p>
                </div>
                <div className="footer">
                  <div className="category">
                    <a
                      href={slide.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ "--i": 0 }}
                    >
                      <LinkedinFilled />
                    </a>
                    <a
                      href={slide.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ "--i": 1 }}
                    >
                      <GithubFilled />
                    </a>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </main>
  );
};

export default Developer;
