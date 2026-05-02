export function generateHeightOptions() {
  const options = [];
  for (let feet = 3; feet <= 7; feet++) {
    for (let inches = 0; inches < 12; inches++) {
      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);
      options.push({ feet, inches, cm });
    }
  }
  return options;
}
