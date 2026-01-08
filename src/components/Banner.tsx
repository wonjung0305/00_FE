import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// swiper 기능
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Swiper 필수 스타일
import "swiper/css";
import "swiper/css/navigation";

import styles from "@/styles/Banner.module.css";
import { getCardNews, type CardNewsItem } from "@/lib/api/banner";

type BannerViewItem = {
  id: string;
  imgSrc: string;
  alt: string;
  link: string;
};

// !!!!!!!!! 매주 여기만 수정하면 되는 배너 이미지 세트 !!!!!!!!!
const BANNER_IMAGES = [
  "/banners/banner_01.svg",
  "/banners/banner_02.svg",
  "/banners/banner_03.svg",
  "/banners/banner_04.svg",
];

export default function Banner() {
  const [items, setItems] = useState<BannerViewItem[]>([]);

  // 배너 데이터 (이미지 경로, 클릭시 이동할 주소)

  /*
    내용 매번 수정해야 되는 부분
    imgSrc => 보여줄 이미지
    link => 해당 이미지와 관련된 청원으로 이동
  */
  useEffect(() => {
    const fetchBanner = async () => {
      const UNIQUE = 4; // 링크(카드뉴스) 4개
      const REPEAT = 2; // 2번 반복 → 총 8개

      // 서버에서 4개만 가져옴 (1,2,3,4) => 인기순으로
      const list = await getCardNews({ how: 0, limit: UNIQUE });

      // 서버가 4개 미만이면 그만큼만
      const baseCount = Math.min(list.length, UNIQUE);
      if (baseCount === 0) {
        setItems([]);
        return;
      }

      // (1,2,3,4)를 REPEAT번 반복해서 (1,2,3,4,1,2,3,4)
      const mapped: BannerViewItem[] = Array.from(
        { length: baseCount * REPEAT },
        (_, idx) => {
          const baseIdx = idx % baseCount; // 0..baseCount-1 반복
          const p: CardNewsItem = list[baseIdx];
          const id = String(p.id);

          return {
            id: `${id}-${idx}`, // key 중복 방지용(중요)
            imgSrc: BANNER_IMAGES[baseIdx], // 이미지도 같은 방식으로 반복
            alt: p.title ?? "배너",
            link: `/petition/${id}`, // 링크도 반복됨
          };
        }
      );

      setItems(mapped);
    };

    fetchBanner();
  }, []);

  return (
    <>
      <div className={styles.bannerWrapper}>
        {items.length > 0 && (
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
          // 5초마다 자동 넘김
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          className={styles.swiperContainer}
        >
          {items.map((banner) => (
            <SwiperSlide key={banner.id} className={styles.slide}>
              {/* 클릭했을 때 이동하는 링크 */}
              <Link href={banner.link} className={styles.linkBlock}>
                <Image
                  src={banner.imgSrc}
                  alt={banner.alt}
                  fill // 부모 박스 꽉차게
                  style={{ objectFit: "cover" }} // 비율 유지하면서
                  priority // 첫 로딩 속도 향상
                  // 이미지 끌려나오는거 방지
                  draggable={false}
                  // 드래그 시작 이벤트 자체를 강제로 취소 (가장 확실한 방법)
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
