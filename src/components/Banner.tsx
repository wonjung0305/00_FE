import Link from "next/link";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import styles from "@/styles/Banner.module.css";

type BannerViewItem = {
  id: string;
  imgSrc: string;
  alt: string;
  link: string;
};

// !!!!!!!!! 매주 여기만 수정하면 되는 배너 이미지 세트 !!!!!!!!!
// id와 img, link 연결하기
const WEEKLY_BANNERS: BannerViewItem[] = [
  {
    id: "2026w02-1",
    imgSrc: "/banners/banner_01.svg",
    alt: "주간 TOP 1",
    link: "/petition/3",
  },
  {
    id: "2026w02-2",
    imgSrc: "/banners/banner_02.svg",
    alt: "주간 TOP 2",
    link: "/petition/4",
  },
  {
    id: "2026w02-3",
    imgSrc: "/banners/banner_03.svg",
    alt: "주간 TOP 3",
    link: "/petition/5",
  },
  {
    id: "2026w02-4",
    imgSrc: "/banners/banner_04.svg",
    alt: "주간 TOP 4",
    link: "/petition/6",
  },
];

export default function Banner() {
  // 배너 데이터 (이미지 경로, 클릭시 이동할 주소)

  /*
    내용 매번 수정해야 되는 부분
    imgSrc => 보여줄 이미지
    link => 해당 이미지와 관련된 청원으로 이동
  */

  const hasBanners = WEEKLY_BANNERS.length > 0;
  const enableLoop = WEEKLY_BANNERS.length > 1;

  return (
    <>
      <div className={styles.bannerWrapper}>
        {hasBanners && (
          <Swiper
            /* 화살표, 자동재생 사용 */
            modules={[Navigation, Autoplay]}
            // 슬라이드 간격
            spaceBetween={24}
            // CSS
            slidesPerView={"auto"}
            // 활성화된 슬라이드가 가운데로 오도록
            centeredSlides={true}
            // 무한 반복
            loop={true}
            // 마우스 드래그(터치)로 넘기는 기능 끄기
            allowTouchMove={false}
            // 클릭된 슬라이드를 가운데로 이동시키기
            slideToClickedSlide={true}
            // 4초마다 자동 넘김
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            className={styles.swiperContainer}
          >
            {WEEKLY_BANNERS.map((banner) => (
            <SwiperSlide key={banner.id} className={styles.slide}>
              <Link href={banner.link} className={styles.linkBlock}>
                <Image
                  src={banner.imgSrc}
                  alt={banner.alt}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                />
              </Link>
            </SwiperSlide>
          ))}

          </Swiper>
        )}
      </div>
    </>
  );
}
