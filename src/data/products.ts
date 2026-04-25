export interface Product {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  originalPrice?: number;
  isCombo?: boolean;
  image: string;
}

export const categories = [
  "Todos",
  "UniTv",
  "YouCine",
  "CineDuo",
  "OnPix Tv",
  "LuaTv",
];

export const products: Product[] = [
  // YouCine
  {
    id: "youcine-30d",
    name: "Recarga YouCine 30D",
    category: "YouCine",
    duration: "30 Dias",
    price: 9.99,
    originalPrice: 14.99,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjiC3hrj9gxzZv1BVFbL3t8O_novDtpyzfjG5E1lqwOSU_hsurbuxctljgbIHGn6jvE65o7sd5fWF3ygOLhe_b5rR7QO9ik_cboTnk2T7RaUQ-jl9EGS_bFw9ASHdT-Mocs_zqlnr46kavxgx1SdhYRb9-lJRwoK9Fm93SbxrmioHWKT1y3rV-bOS8VqGE/s320/Design%20sem%20nome%20(1).png",
  },
  {
    id: "youcine-365d",
    name: "Recarga YouCine 365D",
    category: "YouCine",
    duration: "365 Dias",
    price: 90.0,
    originalPrice: 139.99,
    isCombo: true,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjiC3hrj9gxzZv1BVFbL3t8O_novDtpyzfjG5E1lqwOSU_hsurbuxctljgbIHGn6jvE65o7sd5fWF3ygOLhe_b5rR7QO9ik_cboTnk2T7RaUQ-jl9EGS_bFw9ASHdT-Mocs_zqlnr46kavxgx1SdhYRb9-lJRwoK9Fm93SbxrmioHWKT1y3rV-bOS8VqGE/s320/Design%20sem%20nome%20(1).png",
  },
  // UniTv
  {
    id: "unitv-30d",
    name: "Recarga UniTv 30D",
    category: "UniTv",
    duration: "30 Dias",
    price: 15.0,
    originalPrice: 19.99,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi1oCm4Yn0jeXkxub6mwq7VG2iVJZiIxAVzG4-0Yl5ZQZBR8X2cvY8SQV8ai_s8tybwaVgYxRAFVl3NA6-DgpXiZZlITrhDiIou-dCOplnQfrBFx32v5czV48PJsCl6FxmCCF1JepcUQOB8P8tAZ03rs_-xxfr8uaQHJAP-BH-tJiVRv-qAscsGc4gmdaQ/s320/Design%20sem%20nome%20(6).png",
  },
  {
    id: "unitv-90d",
    name: "Recarga UniTv 90D",
    category: "UniTv",
    duration: "90 Dias",
    price: 40.0,
    originalPrice: 54.99,
    isCombo: true,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi1oCm4Yn0jeXkxub6mwq7VG2iVJZiIxAVzG4-0Yl5ZQZBR8X2cvY8SQV8ai_s8tybwaVgYxRAFVl3NA6-DgpXiZZlITrhDiIou-dCOplnQfrBFx32v5czV48PJsCl6FxmCCF1JepcUQOB8P8tAZ03rs_-xxfr8uaQHJAP-BH-tJiVRv-qAscsGc4gmdaQ/s320/Design%20sem%20nome%20(6).png",
  },
  {
    id: "unitv-180d",
    name: "Recarga UniTv 180D",
    category: "UniTv",
    duration: "180 Dias",
    price: 80.0,
    originalPrice: 109.99,
    isCombo: true,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi1oCm4Yn0jeXkxub6mwq7VG2iVJZiIxAVzG4-0Yl5ZQZBR8X2cvY8SQV8ai_s8tybwaVgYxRAFVl3NA6-DgpXiZZlITrhDiIou-dCOplnQfrBFx32v5czV48PJsCl6FxmCCF1JepcUQOB8P8tAZ03rs_-xxfr8uaQHJAP-BH-tJiVRv-qAscsGc4gmdaQ/s320/Design%20sem%20nome%20(6).png",
  },
  {
    id: "unitv-365d",
    name: "Recarga UniTv 365D",
    category: "UniTv",
    duration: "365 Dias",
    price: 100.0,
    originalPrice: 159.99,
    isCombo: true,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi1oCm4Yn0jeXkxub6mwq7VG2iVJZiIxAVzG4-0Yl5ZQZBR8X2cvY8SQV8ai_s8tybwaVgYxRAFVl3NA6-DgpXiZZlITrhDiIou-dCOplnQfrBFx32v5czV48PJsCl6FxmCCF1JepcUQOB8P8tAZ03rs_-xxfr8uaQHJAP-BH-tJiVRv-qAscsGc4gmdaQ/s320/Design%20sem%20nome%20(6).png",
  },
  // CineDuo
  {
    id: "cineduo-365d",
    name: "Recarga CineDuo 365D",
    category: "CineDuo",
    duration: "365 Dias",
    price: 99.99,
    originalPrice: 149.99,
    isCombo: true,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkg2AJBROk5k89kOilsLgkuzamZw0QcDf_ZeaMBMOLCqA2Z_3sJuUjf5BVPUH293tz6-Ac1fCdw8Fc-PFKdbe-2NHh8W0CAMdLqElqUFeQnnIZzAIpB5vrYcDx-gM6vOQF_1t_0nlgbf3HC9tcT1H5zLk0Lccpp_70PgFg8z01Y-6FfTPV5A1UeLYJg28/s320/Design%20sem%20nome%20(3).png",
  },
  // OnPix Tv
  {
    id: "onpix-30d",
    name: "Recarga OnPix Tv 30D",
    category: "OnPix Tv",
    duration: "30 Dias",
    price: 10.0,
    originalPrice: 14.99,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjzjGiqVzOehOp8N46WMOgWTk0GgPxnltkGNX5z5qKDDVzbNfFLciW2mr-P5LiMdQ38dRJ_D_kPtgppUDwhXpnBHWaeucuO8DVwwCIeyhU3Sx4KaSNLb2kjLQhyj2nBT78_GXsJ-euAfaXiqaSmssTrqa6ooeqjozook6uwl94kfGQNBM4mXvhLikNs9Ro/s320/Design%20sem%20nome%20(4).png",
  },
  {
    id: "onpix-365d",
    name: "Recarga OnPix Tv 365D",
    category: "OnPix Tv",
    duration: "365 Dias",
    price: 99.99,
    originalPrice: 149.99,
    isCombo: true,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjzjGiqVzOehOp8N46WMOgWTk0GgPxnltkGNX5z5qKDDVzbNfFLciW2mr-P5LiMdQ38dRJ_D_kPtgppUDwhXpnBHWaeucuO8DVwwCIeyhU3Sx4KaSNLb2kjLQhyj2nBT78_GXsJ-euAfaXiqaSmssTrqa6ooeqjozook6uwl94kfGQNBM4mXvhLikNs9Ro/s320/Design%20sem%20nome%20(4).png",
  },
  // LuaTv
  {
    id: "luatv-90d",
    name: "Recarga LuaTv 90D",
    category: "LuaTv",
    duration: "90 Dias",
    price: 51.99,
    originalPrice: 74.99,
    isCombo: true,
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg01mqTGJ5QaaJ-UrH_fo1EABYGuW0EAChobMJnBJiaDIkRfzna1-4Ejp5WBLAAuciOpj7rxEcHm6Fa_-olrdnRYCssKI2ALsYyeVKcH5X8mBO9pGALJlExreA6Q66J-9KBrB2HNNrz2Darw-GvQjJV18YnpgbDrElFcHyBJE1bKaHjdEJYMXxyZg2UVAA/s320/Design%20sem%20nome%20(5).png",
  },
];
