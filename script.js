const spaces = [
  {
    id: 1,
    name: "Sala Coworking A",
    type: "Coworking",
    capacity: 20,
    equipment: "Proyector",
    location: "Toluca",
    price: 750,
    image: "img/coworking.jpg"
  },
  {
    id: 2,
    name: "Salón de Eventos B",
    type: "Salón",
    capacity: 100,
    equipment: "Audio",
    location: "Toluca",
    price: 1200,
    image: "img/salon.jpg"
  },
  {
    id: 3,
    name: "Sala de reuniones C",
    type: "Reuniones",
    capacity: 8,
    equipment: "Pantalla",
    location: "Toluca",
    price: 500,
    image: "img/reunion.jpg"
  }
];

const homeView = document.getElementById("homeView");
const reservationView = document.getElementById("reservationView");
const adminView = document.getElementById("adminView");

const backToHome = document.getElementById("backToHome");
const backFromAdmin = document.getElementById("backFromAdmin");
const goHomeLogo = document.getElementById("goHomeLogo");
const navHome = document.getElementById("navHome");
const openAdminDashboard = document.getElementById("openAdminDashboard");

const reserveImage = document.getElementById("reserveImage");
const reserveMiniName = document.getElementById("reserveMiniName");
const reserveMiniType = document.getElementById("reserveMiniType");
const reserveMiniCapacity = document.getElementById("reserveMiniCapacity");
const reserveMiniEquip = document.getElementById("reserveMiniEquip");
const reserveMiniLocation = document.getElementById("reserveMiniLocation");
const reserveMiniPrice = document.getElementById("reserveMiniPrice");

const reserveTitle = document.getElementById("reserveTitle");
const reserveType = document.getElementById("reserveType");
const reserveCapacity = document.getElementById("reserveCapacity");
const reserveEquipTag = document.getElementById("reserveEquipTag");
const reserveLocationTag = document.getElementById("reserveLocationTag");
const reservePrice = document.getElementById("reservePrice");

const reserveDateText = document.getElementById("reserveDateText");
const reserveHourText = document.getElementById("reserveHourText");
const reserveAssistantsText = document.getElementById("reserveAssistantsText");
const reserveTotalText = document.getElementById("reserveTotalText");

const summaryDate = document.getElementById("summaryDate");
const summaryHour = document.getElementById("summaryHour");
const summaryAssistants = document.getElementById("summaryAssistants");
const summaryTotal = document.getElementById("summaryTotal");

const assistantsCount = document.getElementById("assistantsCount");
const minusBtn = document.getElementById("minusBtn");
const plusBtn = document.getElementById("plusBtn");
const confirmReservation = document.getElementById("confirmReservation");

let currentSpace = null;
let selectedTime = "13:00 - 15:00";
let selectedHours = 2;
let assistants = 10;
let selectedDate = "12 Marzo 2026";

function hideAllViews() {
  homeView.classList.add("hidden");
  reservationView.classList.add("hidden");
  adminView.classList.add("hidden");
}

function showHome() {
  hideAllViews();
  homeView.classList.remove("hidden");
}

function showReservation() {
  hideAllViews();
  reservationView.classList.remove("hidden");
}

function showAdmin() {
  hideAllViews();
  adminView.classList.remove("hidden");
}

function updateReservationUI() {
  if (!currentSpace) return;

  reserveImage.src = currentSpace.image;
  reserveImage.alt = currentSpace.name;

  reserveMiniName.textContent = currentSpace.name;
  reserveMiniType.textContent = currentSpace.type;
  reserveMiniCapacity.textContent = `Capacidad: ${currentSpace.capacity} personas`;
  reserveMiniEquip.textContent = currentSpace.equipment;
  reserveMiniLocation.textContent = currentSpace.location;
  reserveMiniPrice.textContent = `$${currentSpace.price} MXN/hora`;

  reserveTitle.textContent = currentSpace.name;
  reserveType.textContent = currentSpace.type;
  reserveCapacity.textContent = `Capacidad: ${currentSpace.capacity} personas`;
  reserveEquipTag.textContent = currentSpace.equipment;
  reserveLocationTag.textContent = currentSpace.location;
  reservePrice.textContent = `$${currentSpace.price} MXN`;

  const total = currentSpace.price * selectedHours;

  reserveDateText.textContent = selectedDate;
  reserveHourText.textContent = selectedTime;
  reserveAssistantsText.textContent = assistants;
  reserveTotalText.textContent = `$${total} MXN`;

  summaryDate.textContent = selectedDate;
  summaryHour.textContent = selectedTime;
  summaryAssistants.textContent = assistants;
  summaryTotal.textContent = `$${total} MXN`;

  assistantsCount.textContent = assistants;
}

function openReservation(spaceId) {
  const foundSpace = spaces.find(space => space.id === Number(spaceId));
  if (!foundSpace) return;

  currentSpace = foundSpace;
  assistants = 10;
  selectedTime = "13:00 - 15:00";
  selectedHours = 2;

  document.querySelectorAll(".time-slot").forEach(btn => {
    btn.classList.remove("active-slot");
    if (btn.textContent.trim() === selectedTime) {
      btn.classList.add("active-slot");
    }
  });

  updateReservationUI();
  showReservation();
}

document.querySelectorAll(".space-card").forEach(card => {
  card.addEventListener("click", () => {
    openReservation(card.dataset.spaceId);
  });
});

document.querySelectorAll(".details-btn").forEach(button => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const card = event.target.closest(".space-card");
    if (!card) return;
    openReservation(card.dataset.spaceId);
  });
});

document.querySelectorAll(".time-slot").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".time-slot").forEach(btn => {
      btn.classList.remove("active-slot");
    });

    button.classList.add("active-slot");
    selectedTime = button.textContent.trim();
    selectedHours = Number(button.dataset.hours);
    updateReservationUI();
  });
});

plusBtn.addEventListener("click", () => {
  if (!currentSpace) return;

  if (assistants < currentSpace.capacity) {
    assistants++;
    updateReservationUI();
  }
});

minusBtn.addEventListener("click", () => {
  if (assistants > 1) {
    assistants--;
    updateReservationUI();
  }
});

confirmReservation.addEventListener("click", () => {
  if (!currentSpace) return;

  const total = currentSpace.price * selectedHours;

  alert(
    `Reserva confirmada\n\n` +
    `Espacio: ${currentSpace.name}\n` +
    `Fecha: ${selectedDate}\n` +
    `Horario: ${selectedTime}\n` +
    `Asistentes: ${assistants}\n` +
    `Total: $${total} MXN`
  );
});

backToHome.addEventListener("click", showHome);
backFromAdmin.addEventListener("click", showHome);

goHomeLogo.addEventListener("click", showHome);

navHome.addEventListener("click", (event) => {
  event.preventDefault();
  showHome();
});

openAdminDashboard.addEventListener("click", showAdmin);