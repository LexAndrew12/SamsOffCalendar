# Band Practice Scheduler Application Specification

This specification outlines a single-page web application for scheduling band practices for a 3-member band (Andrew, Sanya, Patrick). The application will be in Hungarian language but this specification is written in English.

## Overview

The application will help band members coordinate their availability and schedule practice sessions. Based on the provided calendar image, the application should focus on displaying monthly views with member availability indicators.

## Technical Requirements

- Single HTML file (index.html) with embedded JavaScript
- One separate CSS file (styles.css)
- No external libraries required (vanilla JavaScript)
- Browser-based application
- Data storage using localStorage

## Features

1. **Monthly Calendar View**
   - Display days of the month in a grid format
   - Highlight current day
   - Show day numbers and weekday names in Hungarian

2. **Member Availability Management**
   - Allow each member to mark their availability for specific days
   - Color-coded system:
     - Green: Available
     - Red: Not available
   - Display names of available members on each day

3. **Event Types**
   - Allow creating different event types (Próba, Stúdiózás, Videózás, etc.)
   - Custom event types can be added

4. **Automatic Suggestion**
   - Suggest optimal practice dates based on member availability
   - Prioritize dates when all members are available

5. **Weekly View Option**
   - Toggle between monthly and weekly views

## HTML Structure

```html



    
    
    Zenekar Próba Időpont Egyeztető
    


    
        
            Zenekar Próba Időpont Egyeztető
            
                Havi nézet
                Heti nézet
            
        

        
            
                &lt;
                2025 Március
                &gt;
            
            
            
                Hétfő
                Kedd
                Szerda
                Csütörtök
                Péntek
                Szombat
                Vasárnap
            
            
            
        

        
            
                Elérhetőség beállítása
                
                    Tag:
                    
                        Andrew
                        Sanya
                        Patrick
                    
                
                
                    Dátum:
                    
                
                
                    Elérhető
                    Nem elérhető
                
            

            
                Esemény létrehozása
                
                    
                        Dátum:
                        
                    
                    
                        Típus:
                        
                            Próba
                            Stúdiózás
                            Videózás
                            Egyéb...
                        
                        
                    
                    Esemény létrehozása
                
            

            
                Javasolt időpontok
                Javaslatok generálása
                
            
        
    

    
        // Application state
        const state = {
            currentDate: new Date(),
            selectedDate: new Date(),
            members: ['Andrew', 'Sanya', 'Patrick'],
            availability: {},
            events: []
        };

        // Load data from localStorage
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

        // Save data to localStorage
        function saveData() {
            localStorage.setItem('bandAvailability', JSON.stringify(state.availability));
            localStorage.setItem('bandEvents', JSON.stringify(state.events));
        }

        // Calendar rendering
        function renderCalendar() {
            const year = state.currentDate.getFullYear();
            const month = state.currentDate.getMonth();
            
            // Set the current month text
            const monthNames = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 
                               'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
            document.getElementById('currentMonth').textContent = `${year} ${monthNames[month]}`;
            
            // Clear previous days
            const calendarDays = document.getElementById('calendarDays');
            calendarDays.innerHTML = '';
            
            // Get first day of month and total days
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const totalDays = lastDay.getDate();
            
            // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
            let firstDayOfWeek = firstDay.getDay();
            // Adjust for Monday as first day of week
            firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
            
            // Add empty cells for days before first day of month
            for (let i = 0; i  0) {
                    const availabilityDiv = document.createElement('div');
                    availabilityDiv.className = 'availability';
                    
                    availableMembers.forEach(member => {
                        const memberSpan = document.createElement('div');
                        memberSpan.className = 'member available';
                        memberSpan.textContent = member;
                        availabilityDiv.appendChild(memberSpan);
                    });
                    
                    // Add unavailable members
                    state.members.forEach(member => {
                        if (!availableMembers.includes(member)) {
                            const memberSpan = document.createElement('div');
                            memberSpan.className = 'member unavailable';
                            memberSpan.textContent = member;
                            availabilityDiv.appendChild(memberSpan);
                        }
                    });
                    
                    dayElement.appendChild(availabilityDiv);
                }
                
                // Add events
                if (dayEvents.length > 0) {
                    const eventsDiv = document.createElement('div');
                    eventsDiv.className = 'events';
                    
                    dayEvents.forEach(event => {
                        const eventDiv = document.createElement('div');
                        eventDiv.className = 'event';
                        eventDiv.textContent = event.type;
                        eventsDiv.appendChild(eventDiv);
                    });
                    
                    dayElement.appendChild(eventsDiv);
                }
                
                // Highlight current day
                const today = new Date();
                if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayElement.classList.add('today');
                }
                
                // Add click event
                dayElement.addEventListener('click', () => {
                    // Update selected date
                    state.selectedDate = new Date(year, month, day);
                    document.getElementById('dateSelect').valueAsDate = state.selectedDate;
                    document.getElementById('eventDate').valueAsDate = state.selectedDate;
                    
                    // Remove selected class from all days
                    document.querySelectorAll('.day.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked day
                    dayElement.classList.add('selected');
                });
                
                calendarDays.appendChild(dayElement);
            }
        }

        // Helper functions
        function getAvailableMembersForDate(dateString) {
            if (!state.availability[dateString]) {
                return [];
            }
            
            return Object.keys(state.availability[dateString])
                .filter(member => state.availability[dateString][member] === true);
        }

        function getEventsForDate(dateString) {
            return state.events.filter(event => event.date === dateString);
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

        function formatDate(date) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        function generateSuggestions() {
            const suggestions = [];
            const today = new Date();
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 2); // Look ahead 2 months
            
            // Loop through dates
            for (let d = new Date(today); d = 2) { // At least 2 members available
                    suggestions.push({
                        date: new Date(d),
                        dateString: dateString,
                        availableMembers: availableMembers,
                        score: availableMembers.length
                    });
                }
            }
            
            // Sort by number of available members (descending)
            suggestions.sort((a, b) => b.score - a.score);
            
            // Display suggestions
            const suggestionsList = document.getElementById('suggestionsList');
            suggestionsList.innerHTML = '';
            
            if (suggestions.length === 0) {
                suggestionsList.innerHTML = 'Nincs elegendő elérhetőségi adat a javaslattételhez.';
                return;
            }
            
            // Take top 5 suggestions
            suggestions.slice(0, 5).forEach(suggestion => {
                const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
                const formattedDate = suggestion.date.toLocaleDateString('hu-HU', options);
                
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                
                const dateDiv = document.createElement('div');
                dateDiv.className = 'suggestion-date';
                dateDiv.textContent = formattedDate;
                
                const membersDiv = document.createElement('div');
                membersDiv.className = 'suggestion-members';
                membersDiv.textContent = `Elérhető tagok: ${suggestion.availableMembers.join(', ')}`;
                
                const createBtn = document.createElement('button');
                createBtn.className = 'create-event-btn';
                createBtn.textContent = 'Próba létrehozása';
                createBtn.addEventListener('click', () => {
                    createEvent(suggestion.date, 'Próba');
                    suggestionsList.innerHTML = '';
                });
                
                suggestionItem.appendChild(dateDiv);
                suggestionItem.appendChild(membersDiv);
                suggestionItem.appendChild(createBtn);
                
                suggestionsList.appendChild(suggestionItem);
            });
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', () => {
            loadData();
            
            // Set default date inputs to today
            document.getElementById('dateSelect').valueAsDate = new Date();
            document.getElementById('eventDate').valueAsDate = new Date();
            
            // Initialize calendar
            renderCalendar();
            
            // Month navigation
            document.getElementById('prevMonth').addEventListener('click', () => {
                state.currentDate.setMonth(state.currentDate.getMonth() - 1);
                renderCalendar();
            });
            
            document.getElementById('nextMonth').addEventListener('click', ()

