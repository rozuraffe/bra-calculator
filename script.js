"use strict";


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


function calculateBand(underCm) {
    return Math.floor((underCm + 2.5) / 5) * 5;
}


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
        (differenceCm - epsilon) / CUP_INTERVAL_CM
    );
}


function calculateCupRecommendation(differenceCm) {
    const mainIndex =
        calculateMainCupIndex(differenceCm);

    if (mainIndex === null) {
        return null;
    }

    if (mainIndex === 0) {
        return [getCupName(0)];
    }

    const lowerBoundary =
        (mainIndex - 1) * CUP_INTERVAL_CM;

    const upperBoundary =
        mainIndex * CUP_INTERVAL_CM;

    const distanceFromLower =
        differenceCm - lowerBoundary;

    const distanceToUpper =
        upperBoundary - differenceCm;

    if (distanceFromLower <= OVERLAP_CM) {
        return [
            getCupName(mainIndex - 1),
            getCupName(mainIndex)
        ];
    }

    if (distanceToUpper <= OVERLAP_CM) {
        return [
            getCupName(mainIndex),
            getCupName(mainIndex + 1)
        ];
    }

    return [getCupName(mainIndex)];
}


function formatSingleSize(band, cupName) {
    if (cupName === "Z컵 초과") {
        return `${band} · Z컵 초과`;
    }

    return `${band}${cupName}`;
}


function formatSizeRecommendation(band, cupNames) {
    if (!cupNames || cupNames.length === 0) {
        return "계산 불가";
    }

    const uniqueCups = [...new Set(cupNames)];

    return uniqueCups
        .map(cupName => formatSingleSize(band, cupName))
        .join(" or ");
}


function getSelectedFeatures() {
    const selected = [];

    if (pigeonChestInput.checked) {
        selected.push("새가슴");
    }

    if (upperFullInput.checked) {
        selected.push("윗가슴이 많음");
    }

    if (centerFullInput.checked) {
        selected.push("안쪽 가슴이 많음");
    }

    return selected;
}


function showResult(title, size, detail, isError = false) {
    resultTitle.textContent = title;
    resultSize.textContent = size;
    resultDetail.textContent = detail;

    resultSize.style.color =
        isError ? "#b04f62" : "#c96889";
}


function calculateSize() {
    const standingText =
        standingBustInput.value.trim();

    const leaningText =
        leaningBustInput.value.trim();

    const underText =
        underBustInput.value.trim();

    if (!standingText || !leaningText || !underText) {
        alert("세 가지 측정값을 모두 입력해 주세요.");
        return;
    }

    const standingBust = Number(standingText);
    const leaningBust = Number(leaningText);
    const underBust = Number(underText);

    if (
        !Number.isFinite(standingBust) ||
        !Number.isFinite(leaningBust) ||
        !Number.isFinite(underBust)
    ) {
        alert("숫자만 입력해 주세요.");
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
            "모든 둘레는 0 이상의 숫자로 입력해 주세요.",
            true
        );
        return;
    }

    const averageTop =
        (standingBust + leaningBust) / 2;

    const baseDifference =
        averageTop - underBust;

    if (baseDifference < 0) {
        showResult(
            "입력값 확인",
            "계산 불가",
            "평균 윗가슴둘레가 밑가슴둘레보다 작습니다.\n측정값을 다시 확인해 주세요.",
            true
        );
        return;
    }

    const band = calculateBand(underBust);

    const baseCups =
        calculateCupRecommendation(baseDifference);

    const baseSize =
        formatSizeRecommendation(band, baseCups);

    const selectedFeatures =
        getSelectedFeatures();

    const bonusCm =
        selectedFeatures.length * BODY_SHAPE_BONUS_CM;

    const adjustedDifference =
        baseDifference + bonusCm;

    const adjustedCups =
        calculateCupRecommendation(adjustedDifference);

    const adjustedSize =
        formatSizeRecommendation(band, adjustedCups);

    if (selectedFeatures.length === 0) {
        const boundaryText =
            baseCups.length === 2
                ? "\n컵 경계에 가까워 두 사이즈를 함께 추천합니다."
                : "";

        showResult(
            "기본 측정 사이즈",
            baseSize,
            `서서 잰 윗가슴둘레: ${standingBust.toFixed(1)}cm
숙여서 잰 윗가슴둘레: ${leaningBust.toFixed(1)}cm
평균 윗가슴둘레: ${averageTop.toFixed(1)}cm
실측 밑가슴둘레: ${underBust.toFixed(1)}cm
탑-언더 차이: ${baseDifference.toFixed(1)}cm${boundaryText}`
        );

        return;
    }

    const boundaryText =
        adjustedCups.length === 2
            ? "\n컵 경계에 가까워 두 사이즈를 함께 추천합니다."
            : "";

    showResult(
        "체형 보정 추천 사이즈",
        adjustedSize,
        `기본 측정 사이즈: ${baseSize}
체형 보정 추천: ${adjustedSize}

선택한 특징: ${selectedFeatures.join(", ")}
체형 보정값: +${bonusCm.toFixed(1)}cm

평균 윗가슴둘레: ${averageTop.toFixed(1)}cm
기본 탑-언더 차이: ${baseDifference.toFixed(1)}cm
보정 후 탑-언더 차이: ${adjustedDifference.toFixed(1)}cm${boundaryText}`
    );
}


function resetCalculator() {
    standingBustInput.value = "";
    leaningBustInput.value = "";
    underBustInput.value = "";

    pigeonChestInput.checked = false;
    upperFullInput.checked = false;
    centerFullInput.checked = false;

    resultTitle.textContent = "계산 결과";
    resultSize.textContent = "—";
    resultSize.style.color = "#c96889";
    resultDetail.textContent =
        "세 가지 치수를 입력해 주세요.";

    standingBustInput.focus();
}


calculateButton.addEventListener(
    "click",
    calculateSize
);

resetButton.addEventListener(
    "click",
    resetCalculator
);


underBustInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            calculateSize();
        }
    }
);