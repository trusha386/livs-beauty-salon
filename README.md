# LIV'S BEAUTY SALON — Salon Management System

Welcome to the premium **LIV'S BEAUTY SALON** Salon Management PWA (Progressive Web Application). 

This is a modern, dynamic, full-stack management system with a rich warm mocha-cream visual aesthetic, designed to handle stylist signups, logins, dynamic appointment entries, Indian Rupee (₹) currency formatting, and dynamic commission reporting.

---

## Key Core Features

1. **Absolutely Zero Predefined Data**: 
   The application starts completely clean. No fake staff (e.g., Sarah Stylist, Emma, John), no fake customers (Countess Julia, Princess Elena), no default appointments, and no preloaded reports exist on database launch.
   
2. **Dynamic Sign Up & Session Profiles**: 
   Stylists or administrators can register using the **Register** tab. The sidebar displays dynamic initials extraction (e.g., "Priya Shah" $\rightarrow$ `PS`) and greets logged-in users.
   
3. **Indian Salon Services Catalog**: 
   The database automatically seeds 14 realistic Indian salon services:
   * **Haircut** — ₹399
   * **Hair Spa** — ₹1499
   * **Facial Cleanup** — ₹899
   * **Bridal Makeup** — ₹8999
   * **Keratin Treatment** — ₹4999
   * **Manicure** — ₹699
   * **Pedicure** — ₹999
   * **Threading** — ₹99
   * **Waxing** — ₹799
   * **Detan Facial** — ₹1299
   * **Hair Coloring** — ₹2499
   * **Nail Art** — ₹1499
   * **Smoothening** — ₹5999
   * **Head Massage** — ₹499
   
4. **Premium SVG Analytics**: 
   Custom-rendered SVG line/area charts for monthly revenue trends and service popularity bar charts show pristine empty states initially, and update reactively as soon as the first visit is logged.
   
5. **Real-time 10% Stylist Commission Calculations**: 
   Commission is automatically calculated and enforced at a standard rate of 10% of the total billing price before database write actions.
   
6. **Dual Mode Connectivity Badge**: 
   Features a fallback mechanism that automatically toggles between **API Connected (Live)** and **Demo Mode (API Offline)** with persistent `localStorage` synchronization.

---

## Technical Stack

* **Frontend**: Vanilla HTML5, CSS3 Custom Properties (Mocha Cream Aesthetic), Vanilla JavaScript (PWA Service Workers & Manifest enabled).
* **Backend**: Spring Boot 3.2.5, H2 Database Engine, Spring Data JPA, Lombok, Jakarta Validation.

---

## How to Execute the Project

### Running the Java Spring Boot Backend

You can run the backend using any Java IDE (Visual Studio Code, IntelliJ, or Visual Studio with Java Extension Pack) or directly via the command line:

1. Ensure you have **Java 17** (or later) and **Maven** installed.
2. Navigate to the `/backend` directory:
   ```bash
   cd backend
   ```
3. Run the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
4. The server will launch on `http://localhost:8080`.
5. You can view the H2 Database Console at `http://localhost:8080/h2-console` with:
   * **JDBC URL**: `jdbc:h2:mem:salondb`
   * **Username**: `sa`
   * **Password**: `password`

### Running the Frontend PWA

1. Open the `/frontend` directory.
2. Launch a local web server (e.g., using VS Code Live Server extension, `npx serve`, or Python's `python -m http.server 5500`).
3. Access the web app in your browser (e.g., `http://127.0.0.1:5500`).
4. The application will detect the backend API automatically and display **API Connected (Live)**. If the backend is off, it falls back to **Demo Mode (API Offline)** smoothly.

### How to Run Automated Unit Tests

Execute the full suite of unit and integration tests inside the `/backend` directory:
```bash
mvn test
```

---

## Caching & Troubleshooting Tips

> [!NOTE]
> Since this is a Progressive Web App (PWA), the service worker (`sw.js`) caches resources aggressively for offline usage.
> 
> * **Clear Caching**: If you do not see the updated PWA branding or dynamic features instantly on load, open DevTools (F12) $\rightarrow$ **Application** tab $\rightarrow$ **Service Workers** $\rightarrow$ Click **Unregister** and refresh the page, or load the page in an **Incognito / Private Window**.
> * **Purging Local Storage**: If old mock records remain from previous builds in your browser, the script's **Database Migration Hook** will automatically execute on boot to wipe obsolete local storage keys, giving you a completely clean state.
