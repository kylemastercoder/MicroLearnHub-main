export const calculateAge = (birthdate: string) => {
  const [day, month, year] = birthdate.split("/").map(Number);
  if (!day || !month || !year) return "";

  const today = new Date();
  const birthDate = new Date(year, month - 1, day); // Months are 0-based in JavaScript
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust age if the birthdate hasn't occurred yet this year
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age.toString();
};

export const getInitials = (fullName: string): string => {
  const names = fullName.split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase(); // Single name case
  }
  return names.map((name) => name.charAt(0).toUpperCase()).join("");
};

export const formatDateToDDMMYYYY = (date: any) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
