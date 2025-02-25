// Application state
const state = {
    currentDate: new Date(),
    selectedDate: new Date(),
    members: ['Andrew', 'Sanya', 'Patrick'],
    availability: {},
    events: [],
    isMonthView: true
};

// Core functions
function loadData() {
    const savedAvailability = localStorage.getItem('bandAvailability');
    const savedEvents = localStorage.getItem('bandEvents');
    
    if (savedAvailability) {
        state.availability = JSON.parse(savedAvailability);
    }
    
    if (savedEvents) {
        state.events = JSON.parse(savedEvents);
    }
}

function saveData() {
    localStorage.setItem('bandAvailability', JSON.stringify(state.availability));
    localStorage.setItem('bandEvents', JSON.stringify(state.events));
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// UI Rendering
function renderCalendar() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    const monthNames = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 
                       'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${year} ${monthNames[month]}`;
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    if (state.isMonthView) {
        renderMonthView(year, month, calendarDays);
    } else {
        renderWeekView(calendarDays);
    }
}

function renderMonthView(year, month, calendarDays) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= totalDays; day++) {
        const currentDate = new Date(year, month, day);
        const dateString = formatDate(currentDate);
        
        const dayElement = createDayElement(day, dateString, currentDate);
        calendarDays.appendChild(dayElement);
    }
}

function createDayElement(day, dateString, currentDate) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day';
    dayElement.innerHTML = `<span>${day}</span>`;
    
    // Mindig hozzuk létre az availability div-et, ha van bármilyen adat
    const dayData = state.availability[dateString];
    if (dayData && Object.keys(dayData).length > 0) {
        const availabilityDiv = createAvailabilityDiv(dateString);
        dayElement.appendChild(availabilityDiv);
    }
    
    const dayEvents = getEventsForDate(dateString);
    if (dayEvents.length > 0) {
        const eventsDiv = createEventsDiv(dayEvents);
        dayElement.appendChild(eventsDiv);
    }
    
    const today = new Date();
    if (day === today.getDate() && 
        currentDate.getMonth() === today.getMonth() && 
        currentDate.getFullYear() === today.getFullYear()) {
        dayElement.classList.add('today');
    }
    
    dayElement.addEventListener('click', () => handleDayClick(currentDate, dayElement));
    
    return dayElement;
}

// Helper functions
function createAvailabilityDiv(dateString) {
    const availabilityDiv = document.createElement('div');
    availabilityDiv.className = 'availability';
    
    const dayData = state.availability[dateString] || {};
    
    state.members.forEach(member => {
        const memberSpan = document.createElement('div');
        
        // Explicit módon ellenőrizzük az elérhetőségi státuszt
        if (dayData[member] === true) {
            memberSpan.className = 'member available';
        } else if (dayData[member] === false) {
            memberSpan.className = 'member unavailable';
        } else {
            memberSpan.className = 'member pending';
        }
        
        memberSpan.textContent = member;
        availabilityDiv.appendChild(memberSpan);
    });
    
    return availabilityDiv;
}

function createEventsDiv(events) {
    const eventsDiv = document.createElement('div');
    eventsDiv.className = 'events';
    
    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        eventDiv.textContent = event.type;
        eventsDiv.appendChild(eventDiv);
    });
    
    return eventsDiv;
}

function getAvailableMembersForDate(dateString) {
    if (!state.availability[dateString]) {
        return [];
    }
    return Object.entries(state.availability[dateString])
        .filter(([_, isAvailable]) => isAvailable)
        .map(([member]) => member);
}

function getEventsForDate(dateString) {
    return state.events.filter(event => event.date === dateString);
}

function renderWeekView(calendarDays) {
    const startOfWeek = new Date(state.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dateString = formatDate(currentDate);
        
        const dayElement = createDayElement(
            currentDate.getDate(),
            dateString,
            currentDate
        );
        calendarDays.appendChild(dayElement);
    }
}

// Event Handlers
function handleDayClick(date, element) {
    state.selectedDate = date;
    
    const modal = document.getElementById('availabilityModal');
    const modalDate = modal.querySelector('.modal-date');
    const memberButtons = modal.querySelector('.member-buttons');
    const availabilityButtons = modal.querySelector('.availability-buttons');
    const deleteDayBtn = modal.querySelector('.delete-day-btn');
    
    const dateString = formatDate(date);
    
    // Csak akkor jelenjen meg a nap törlése gomb, ha van valami adat arra a napra
    const hasData = state.availability[dateString] || 
                   state.events.some(event => event.date === dateString);
    deleteDayBtn.style.display = hasData ? 'block' : 'none';
    
    deleteDayBtn.onclick = () => {
        if (confirm('Biztosan törölni szeretnéd a teljes napot?')) {
            deleteDayData(date);
            closeModal();
        }
    };
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    modalDate.textContent = date.toLocaleDateString('hu-HU', options);
    
    // Tag gombok létrehozása
    memberButtons.innerHTML = '';
    state.members.forEach(member => {
        const button = document.createElement('button');
        button.textContent = member;
        button.onclick = () => showAvailabilityOptions(member, date);
        memberButtons.appendChild(button);
    });
    
    availabilityButtons.style.display = 'none';
    modal.style.display = 'block';
}

function showAvailabilityOptions(member, date) {
    const modal = document.getElementById('availabilityModal');
    const memberButtons = modal.querySelector('.member-buttons');
    const availabilityButtons = modal.querySelector('.availability-buttons');
    
    memberButtons.style.display = 'none';
    availabilityButtons.style.display = 'block';
    
    const dateString = formatDate(date);
    const currentAvailability = state.availability[dateString]?.[member];
    
    const availableBtn = modal.querySelector('.available-btn');
    const unavailableBtn = modal.querySelector('.unavailable-btn');
    const deleteBtn = modal.querySelector('.delete-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    // Jelöljük a jelenlegi állapotot
    availableBtn.classList.toggle('active', currentAvailability === true);
    unavailableBtn.classList.toggle('active', currentAvailability === false);
    
    // Csak akkor jelenjen meg a törlés gomb, ha van mit törölni
    deleteBtn.style.display = currentAvailability !== undefined ? 'block' : 'none';
    
    availableBtn.onclick = () => {
        setMemberAvailability(member, date, true);
        closeModal();
    };
    
    unavailableBtn.onclick = () => {
        setMemberAvailability(member, date, false);
        closeModal();
    };
    
    deleteBtn.onclick = () => {
        deleteMemberAvailability(member, date);
        closeModal();
    };
    
    cancelBtn.onclick = () => {
        memberButtons.style.display = 'block';
        availabilityButtons.style.display = 'none';
    };
}

function deleteMemberAvailability(member, date) {
    const dateString = formatDate(date);
    
    if (state.availability[dateString]) {
        delete state.availability[dateString][member];
        
        // Ha ez volt az utolsó bejegyzés az adott naphoz, töröljük a napot is
        if (Object.keys(state.availability[dateString]).length === 0) {
            delete state.availability[dateString];
        }
    }
    
    saveData();
    renderCalendar();
}

function closeModal() {
    const modal = document.getElementById('availabilityModal');
    modal.style.display = 'none';
    
    const memberButtons = modal.querySelector('.member-buttons');
    const availabilityButtons = modal.querySelector('.availability-buttons');
    
    memberButtons.style.display = 'block';
    availabilityButtons.style.display = 'none';
}

function setMemberAvailability(member, date, isAvailable) {
    const dateString = formatDate(date);
    
    if (!state.availability[dateString]) {
        state.availability[dateString] = {};
    }
    
    state.availability[dateString][member] = isAvailable;
    saveData();
    renderCalendar();
}

function createEvent(date, type) {
    const dateString = formatDate(date);
    
    state.events.push({
        id: Date.now().toString(),
        date: dateString,
        type: type
    });
    
    saveData();
    renderCalendar();
}

function generateSuggestions() {
    const suggestions = [];
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    
    // Végigmegyünk a következő 2 hónapon
    for (let d = new Date(today); d <= futureDate; d.setDate(d.getDate() + 1)) {
        const dateString = formatDate(d);
        
        // Csak akkor vizsgáljuk a napot, ha van már rá bejegyzés
        if (state.availability[dateString]) {
            const dateStatus = analyzeDateAvailability(dateString);
            
            if (dateStatus.hasAnyResponse) {
                suggestions.push({
                    date: new Date(d),
                    dateString: dateString,
                    ...dateStatus
                });
            }
        }
    }
    
    // Rendezés: először ahol mindenki ráér, aztán ahol várunk válaszra, végül ahol nem jó
    suggestions.sort((a, b) => {
        if (a.allAvailable && !b.allAvailable) return -1;
        if (!a.allAvailable && b.allAvailable) return 1;
        if (a.pendingMembers.length < b.pendingMembers.length) return -1;
        if (a.pendingMembers.length > b.pendingMembers.length) return 1;
        return 0;
    });
    
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';
    
    if (suggestions.length === 0) {
        suggestionsList.innerHTML = 'Nincs elegendő elérhetőségi adat a javaslattételhez.';
        return;
    }
    
    suggestions.forEach(suggestion => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const formattedDate = suggestion.date.toLocaleDateString('hu-HU', options);
        
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        
        // Színkódolás az állapot alapján
        if (suggestion.allAvailable) {
            suggestionItem.classList.add('all-available');
        } else if (suggestion.pendingMembers.length > 0) {
            suggestionItem.classList.add('pending');
        } else {
            suggestionItem.classList.add('unavailable');
        }
        
        let content = `
            <div class="suggestion-date">${formattedDate}</div>
            <div class="suggestion-members">Elérhető tagok: ${suggestion.availableMembers.join(', ')}</div>
        `;
        
        if (suggestion.pendingMembers.length > 0) {
            content += `
                <div class="pending-members">
                    Válaszra várunk: ${suggestion.pendingMembers.join(', ')}
                </div>
            `;
        }
        
        if (suggestion.unavailableMembers.length > 0) {
            content += `
                <div class="unavailable-members">
                    Nem elérhető: ${suggestion.unavailableMembers.join(', ')}
                </div>
            `;
        }
        
        content += `<button class="add-to-calendar">Naptárhoz adás</button>`;
        
        suggestionItem.innerHTML = content;
        
        suggestionItem.querySelector('.add-to-calendar').addEventListener('click', () => {
            showEventTypeModal(suggestion.date);
        });
        
        suggestionsList.appendChild(suggestionItem);
    });
}

function analyzeDateAvailability(dateString) {
    const availableMembers = [];
    const unavailableMembers = [];
    const pendingMembers = [...state.members];
    
    if (state.availability[dateString]) {
        Object.entries(state.availability[dateString]).forEach(([member, isAvailable]) => {
            if (isAvailable) {
                availableMembers.push(member);
            } else {
                unavailableMembers.push(member);
            }
            // Töröljük a válaszadót a függőben lévők közül
            const index = pendingMembers.indexOf(member);
            if (index > -1) {
                pendingMembers.splice(index, 1);
            }
        });
    }
    
    return {
        availableMembers,
        unavailableMembers,
        pendingMembers,
        allAvailable: availableMembers.length === state.members.length,
        hasAnyResponse: availableMembers.length > 0 || unavailableMembers.length > 0
    };
}

function deleteDayData(date) {
    const dateString = formatDate(date);
    
    // Töröljük az elérhetőségeket
    if (state.availability[dateString]) {
        delete state.availability[dateString];
    }
    
    // Töröljük az eseményeket
    state.events = state.events.filter(event => event.date !== dateString);
    
    saveData();
    renderCalendar();
}

function showEventTypeModal(date) {
    const modal = document.getElementById('eventTypeModal');
    const modalDate = modal.querySelector('.modal-date');
    const eventTypeSelect = modal.querySelector('#eventTypeSelect');
    const customEventType = modal.querySelector('#customEventType');
    const createBtn = modal.querySelector('.create-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    modalDate.textContent = date.toLocaleDateString('hu-HU', options);
    
    // Reset
    eventTypeSelect.value = 'Próba';
    customEventType.style.display = 'none';
    customEventType.value = '';
    
    eventTypeSelect.onchange = () => {
        customEventType.style.display = 
            eventTypeSelect.value === 'Egyéb' ? 'block' : 'none';
    };
    
    createBtn.onclick = () => {
        const type = eventTypeSelect.value === 'Egyéb' 
            ? customEventType.value || 'Egyéb esemény'
            : eventTypeSelect.value;
            
        createEvent(date, type);
        modal.style.display = 'none';
    };
    
    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.style.display = 'block';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderCalendar();
    
    // Event listeners for controls
    document.getElementById('prevMonth').addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    document.getElementById('monthView').addEventListener('click', () => {
        state.isMonthView = true;
        renderCalendar();
    });
    
    document.getElementById('weekView').addEventListener('click', () => {
        state.isMonthView = false;
        renderCalendar();
    });
    
    document.getElementById('generateSuggestions').addEventListener('click', generateSuggestions);
    
    window.onclick = function(event) {
        const availabilityModal = document.getElementById('availabilityModal');
        const eventTypeModal = document.getElementById('eventTypeModal');
        if (event.target === availabilityModal) {
            closeModal();
        }
        if (event.target === eventTypeModal) {
            eventTypeModal.style.display = 'none';
        }
    };
});
