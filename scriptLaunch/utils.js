


export const calculatePercentages = (inputNumber) => {
    // The list of percentages from the "New Distribution"
    const percentages = [
        0.10, 0.20, 0.30, 0.40, 0.55, 0.75, 1.18, 1.61, 2.04,
        2.47, 2.90, 3.33, 3.83, 4.33, 4.83, 5.33, 5.83, 6.43,
        7.03, 7.63, 8.23, 9.03, 10.00, 11.67
    ];

    // Calculate each percentage of the input number and store in an array
    const result = percentages.map(percent => (percent / 100) * inputNumber * 10 ** 9);

    return result;
}