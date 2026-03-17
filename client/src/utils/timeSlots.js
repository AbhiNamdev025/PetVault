export const generateTimeSlots = (
  startHour = 9,
  endHour = 20,
  interval = 30,
) => {
  const slots = [];
  for (let i = startHour; i <= endHour; i++) {
    const hour = i < 10 ? `0${i}` : i;

    // Process :00
    const displayHour1 = i > 12 ? i - 12 : i;
    const ampm1 = i >= 12 ? "PM" : "AM";
    const label1 = `${displayHour1 < 10 ? "0" + displayHour1 : displayHour1}:00 ${ampm1}`;
    slots.push({ value: `${hour}:00`, label: label1 });

    // Process :30 (skip if it's the very last hour end time exactly, assume endHour includes :00?)
    // Usually endHour 20 means 20:00 is the last slot or end of day?
    // If availability is "until 20:00", then 20:00 is a slot?
    // Let's stick to the loop.

    if (i !== endHour) {
      // Don't add 20:30 if end is 20:00
      const displayHour2 = i > 12 ? i - 12 : i;
      const ampm2 = i >= 12 ? "PM" : "AM";
      const label2 = `${displayHour2 < 10 ? "0" + displayHour2 : displayHour2}:30 ${ampm2}`;
      slots.push({ value: `${hour}:30`, label: label2 });
    }
  }
  return slots;
};

export const TIME_SLOTS = generateTimeSlots();
