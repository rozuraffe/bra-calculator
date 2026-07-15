"use strict";


/* ==================================================
   계산 기준
================================================== */

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
const BODY_SHAPE_BONUS_CM = 1.5;


/* ==================================================
   HTML 요소
================================================== */

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

const resultTitle =
    document.getElementById("resultTitle");

const resultSize =
    document.getElementById("resultSize");

const resultDetail =
    document.getElementById("resultDetail");

const calculateButton =
    document.getElementById("calculateButton");

const resetButton =
    document.getElementById("resetButton");


/* ==================================================
   언더사이즈 계산
================================================== */

function calculateBand(underCm) {
    return Math.floor(
        (underCm + 2.5) / 5
    ) * 5;
}


/* ==================================================
   컵 계산
================================================== */

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
        컵 구간의 시작 0.5cm:
        이전 컵 or 현재 컵
    */
    if (distanceFromLower <= OVERLAP_CM) {
        return [
            getCupName(mainIndex - 1),
            getCupName(mainIndex)
        ];
    }

    /*
        컵 구간의 끝 0.5cm:
        현재 컵 or 다음 컵
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


/* ==================================================
   결과 문자열
================================================== */

function formatSingleSize(band, cupName) {
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


/* ==================================================
   체형 특징
================================================== */

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


/* ==================================================
   결과 표시
================================================== */

function showResult(
    title,
    size,
    isError = false
) {
    resultTitle.textContent = title;
    resultSize.textContent = size;

    resultSize.style.color =
        isError
            ? "#b04f62"
            : "#c96889";

    /*
        상세 계산 내용은 표시하지 않지만,
        HTML 요소는 오류 방지를 위해 유지합니다.
    */
    resultDetail.textContent = "";
}


/* ==================================================
   계산 실행
================================================== */

function calculateSize() {
    const standingText =
        standingBustInput.value.trim();

    const leaningText =
        leaningBustInput.value.trim();

    const underText =
        underBustInput.value.trim();


    /* 빈칸 확인 */

    if (
        !standingText ||
        !leaningText ||
        !underText
    ) {
        alert(
            "세 가지 측정값을 모두 입력해 주세요."
        );

        return;
    }


    /* 숫자로 변환 */

    const standingBust =
        Number(standingText);

    const leaningBust =
        Number(leaningText);

    const underBust =
        Number(underText);


    /* 숫자 유효성 확인 */

    if (
        !Number.isFinite(standingBust) ||
        !Number.isFinite(leaningBust) ||
        !Number.isFinite(underBust)
    ) {
        alert(
            "숫자만 입력해 주세요."
        );

        return;
    }


    if (
        standingBust < 0 ||
        leaningBust < 0 ||
        underBust < 0
    ) {
        showResult(
            "입력값 확인",
            "계산 불가",
            true
        );

        return;
    }


    /* 평균 탑둘레 */

    const averageTop =
        (
            standingBust +
            leaningBust
        ) / 2;


    /* 기본 탑-언더 차이 */

    const baseDifference =
        averageTop -
        underBust;


    if (baseDifference < 0) {
        showResult(
            "입력값 확인",
            "계산 불가",
            true
        );

        return;
    }


    /* 언더사이즈 */

    const band =
        calculateBand(underBust);


    /* 체형 특징 선택 수 */

    const selectedFeatureCount =
        getSelectedFeatureCount();


    /* 한 항목당 1.5cm 보정 */

    const bonusCm =
        selectedFeatureCount *
        BODY_SHAPE_BONUS_CM;


    /* 보정 후 차이 */

    const finalDifference =
        baseDifference +
        bonusCm;


    /* 최종 추천 컵 */

    const finalCups =
        calculateCupRecommendation(
            finalDifference
        );


    /* 최종 사이즈 */

    const finalSize =
        formatSizeRecommendation(
            band,
            finalCups
        );


    if (selectedFeatureCount === 0) {
        showResult(
            "추천 사이즈",
            finalSize
        );
    } else {
        showResult(
            "체형 보정 추천 사이즈",
            finalSize
        );
    }
}


/* ==================================================
   초기화
================================================== */

function resetCalculator() {
    standingBustInput.value = "";
    leaningBustInput.value = "";
    underBustInput.value = "";

    pigeonChestInput.checked = false;
    upperFullInput.checked = false;
    centerFullInput.checked = false;

    resultTitle.textContent =
        "계산 결과";

    resultSize.textContent =
        "—";

    resultSize.style.color =
        "#c96889";

    resultDetail.textContent =
        "";

    standingBustInput.focus();
}


/* ==================================================
   버튼 및 키보드 연결
================================================== */

calculateButton.addEventListener(
    "click",
    calculateSize
);

resetButton.addEventListener(
    "click",
    resetCalculator
);


standingBustInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            leaningBustInput.focus();
        }
    }
);


leaningBustInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            underBustInput.focus();
        }
    }
);


underBustInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            calculateSize();
        }
    }
);