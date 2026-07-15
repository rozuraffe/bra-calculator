"use strict";


/* =========================================================
   계산 기준
========================================================= */

const CUP_SIZES = [
    "AAAAA",
    "AAAA",
    "AAA",
    "AA",
    "A",
    "B", "C", "D", "E", "F", "G",
    "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S",
    "T", "U", "V", "W", "X", "Y", "Z"
];


const CUP_INTERVAL_CM = 2.5;
const OVERLAP_CM = 0.5;
const BODY_SHAPE_BONUS_CM = 1.2;


/* =========================================================
   HTML 요소
========================================================= */

const standingBustInput =
    document.getElementById("standingBust");

const leaningBustInput =
    document.getElementById("leaningBust");

const underBustInput =
    document.getElementById("underBust");


const pigeonChestInput =
    document.getElementById("pigeonChest");

const upperFullInput =
    document.getElementById("upperFull");

const centerFullInput =
    document.getElementById("centerFull");


const calculateButton =
    document.getElementById("calculateButton");

const resetButton =
    document.getElementById("resetButton");


const resultTitle =
    document.getElementById("resultTitle");

const resultSize =
    document.getElementById("resultSize");

const errorMessage =
    document.getElementById("errorMessage");


const leftGuideImage =
    document.getElementById("leftGuideImage");

const leftGuidePlaceholder =
    document.getElementById("leftGuidePlaceholder");

const rightGuideImage =
    document.getElementById("rightGuideImage");

const rightGuidePlaceholder =
    document.getElementById("rightGuidePlaceholder");


/* =========================================================
   언더사이즈 계산
========================================================= */

function calculateBand(underCm) {
    return Math.floor(
        (underCm + 2.5) / 5
    ) * 5;
}


/* =========================================================
   컵 계산
========================================================= */

function getCupName(cupIndex) {
    if (cupIndex < 0) {
        return null;
    }

    if (cupIndex >= CUP_SIZES.length) {
        return "Z컵 초과";
    }

    return CUP_SIZES[cupIndex];
}


function calculateMainCupIndex(differenceCm) {
    if (differenceCm < 0) {
        return null;
    }

    if (differenceCm === 0) {
        return 0;
    }

    const epsilon = 1e-9;

    return Math.ceil(
        (differenceCm - epsilon) /
        CUP_INTERVAL_CM
    );
}


function calculateCupRecommendation(differenceCm) {
    const mainIndex =
        calculateMainCupIndex(differenceCm);

    if (mainIndex === null) {
        return null;
    }

    if (mainIndex === 0) {
        return [
            getCupName(0)
        ];
    }

    const lowerBoundary =
        (mainIndex - 1) *
        CUP_INTERVAL_CM;

    const upperBoundary =
        mainIndex *
        CUP_INTERVAL_CM;

    const distanceFromLower =
        differenceCm -
        lowerBoundary;

    const distanceToUpper =
        upperBoundary -
        differenceCm;


    /*
       컵 구간 시작 부분 0.5cm
       이전 컵 또는 현재 컵
    */

    if (distanceFromLower <= OVERLAP_CM) {
        return [
            getCupName(mainIndex - 1),
            getCupName(mainIndex)
        ];
    }


    /*
       컵 구간 마지막 부분 0.5cm
       현재 컵 또는 다음 컵
    */

    if (distanceToUpper <= OVERLAP_CM) {
        return [
            getCupName(mainIndex),
            getCupName(mainIndex + 1)
        ];
    }


    return [
        getCupName(mainIndex)
    ];
}


/* =========================================================
   사이즈 표시
========================================================= */

function formatSingleSize(
    band,
    cupName
) {
    if (cupName === "Z컵 초과") {
        return `${band} · Z컵 초과`;
    }

    return `${band}${cupName}`;
}


function formatSizeRecommendation(
    band,
    cupNames
) {
    if (
        !cupNames ||
        cupNames.length === 0
    ) {
        return "계산 불가";
    }

    const uniqueCups = [
        ...new Set(cupNames)
    ];

    return uniqueCups
        .map(
            cupName =>
                formatSingleSize(
                    band,
                    cupName
                )
        )
        .join(" or ");
}


/* =========================================================
   체형 특징
========================================================= */

function getSelectedFeatureCount() {
    let count = 0;

    if (pigeonChestInput.checked) {
        count += 1;
    }

    if (upperFullInput.checked) {
        count += 1;
    }

    if (centerFullInput.checked) {
        count += 1;
    }

    return count;
}


/* =========================================================
   결과 표시
========================================================= */

function showResult(
    title,
    size,
    isError = false,
    message = ""
) {
    resultTitle.textContent = title;
    resultSize.textContent = size;
    errorMessage.textContent = message;

    resultSize.style.color =
        isError
            ? "#a72f43"
            : "#c76888";
}


/* =========================================================
   입력값 검사
========================================================= */

function readMeasurements() {
    const standingText =
        standingBustInput.value.trim();

    const leaningText =
        leaningBustInput.value.trim();

    const underText =
        underBustInput.value.trim();


    if (
        standingText === "" ||
        leaningText === "" ||
        underText === ""
    ) {
        showResult(
            "입력값 확인",
            "—",
            true,
            "세 가지 측정값을 모두 입력해 주세요."
        );

        return null;
    }


    const standingBust =
        Number(standingText);

    const leaningBust =
        Number(leaningText);

    const underBust =
        Number(underText);


    if (
        !Number.isFinite(standingBust) ||
        !Number.isFinite(leaningBust) ||
        !Number.isFinite(underBust)
    ) {
        showResult(
            "입력값 확인",
            "—",
            true,
            "숫자만 입력해 주세요."
        );

        return null;
    }


    if (
        standingBust < 0 ||
        leaningBust < 0 ||
        underBust < 0
    ) {
        showResult(
            "입력값 확인",
            "계산 불가",
            true,
            "모든 둘레는 0 이상의 숫자로 입력해 주세요."
        );

        return null;
    }


    return {
        standingBust,
        leaningBust,
        underBust
    };
}


/* =========================================================
   계산 실행
========================================================= */

function calculateSize() {
    const measurements =
        readMeasurements();

    if (!measurements) {
        return;
    }


    const {
        standingBust,
        leaningBust,
        underBust
    } = measurements;


    /*
       서서 잰 탑과 숙여 잰 탑의 평균
    */

    const averageTop =
        (
            standingBust +
            leaningBust
        ) / 2;


    /*
       평균 탑둘레 - 밑가슴둘레
    */

    const baseDifference =
        averageTop -
        underBust;


    if (baseDifference < 0) {
        showResult(
            "입력값 확인",
            "계산 불가",
            true,
            "윗가슴둘레와 밑가슴둘레를 다시 확인해 주세요."
        );

        return;
    }


    /*
       언더를 가장 가까운 5cm 단위로 반올림
    */

    const band =
        calculateBand(underBust);


    /*
       체형 특징 하나당 1.2cm 보정
    */

    const selectedFeatureCount =
        getSelectedFeatureCount();

    const bonusCm =
        selectedFeatureCount *
        BODY_SHAPE_BONUS_CM;


    /*
       체형 보정 후 최종 차이
    */

    const finalDifference =
        baseDifference +
        bonusCm;


    /*
       최종 컵과 사이즈 계산
    */

    const finalCups =
        calculateCupRecommendation(
            finalDifference
        );

    const finalSize =
        formatSizeRecommendation(
            band,
            finalCups
        );


    showResult(
        selectedFeatureCount > 0
            ? "체형 보정 추천 사이즈"
            : "추천 사이즈",
        finalSize
    );
}


/* =========================================================
   초기화
========================================================= */

function resetCalculator() {
    standingBustInput.value = "";
    leaningBustInput.value = "";
    underBustInput.value = "";

    pigeonChestInput.checked = false;
    upperFullInput.checked = false;
    centerFullInput.checked = false;

    showResult(
        "추천 사이즈",
        "—"
    );

    standingBustInput.focus();
}


/* =========================================================
   이미지 오류 처리
========================================================= */

function setGuideImageFallback(
    imageElement,
    placeholderElement
) {
    imageElement.addEventListener(
        "error",
        () => {
            imageElement.style.display = "none";
            placeholderElement.style.display = "flex";
        }
    );


    imageElement.addEventListener(
        "load",
        () => {
            imageElement.style.display = "block";
            placeholderElement.style.display = "none";
        }
    );
}


setGuideImageFallback(
    leftGuideImage,
    leftGuidePlaceholder
);


setGuideImageFallback(
    rightGuideImage,
    rightGuidePlaceholder
);


/* =========================================================
   버튼 연결
========================================================= */

calculateButton.addEventListener(
    "click",
    calculateSize
);


resetButton.addEventListener(
    "click",
    resetCalculator
);


/* =========================================================
   Enter 키 이동
========================================================= */

standingBustInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            event.preventDefault();
            leaningBustInput.focus();
        }
    }
);


leaningBustInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            event.preventDefault();
            underBustInput.focus();
        }
    }
);


underBustInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            event.preventDefault();
            calculateSize();
        }
    }
);