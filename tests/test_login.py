from selenium import webdriver
from selenium.webdriver.chrome.options import Options # configures the browser before launch
from selenium.webdriver.chrome.service import Service as ChromeService # manages the driver process
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager # ChromeDriver translates between selenium and chrome
from webdriver_manager.core.os_manager import ChromeType 
import pytest

BASE_URL = "https://fs-banking-application.vercel.app"
EMAIL = "rowan.96@melodydata.com"
PASSWORD = "111"

def make_driver():
    # Browser configurations before launch == browser's startup settings
    options = Options() # returns configuration object
    options.add_argument("--headless=new") # runs chrome without opening a visible window
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--remote-debugging-port=9222")
    options.binary_location = "/snap/bin/chromium"
    service = ChromeService(ChromeDriverManager(chrome_type=ChromeType.CHROMIUM).install())
    return webdriver.Chrome(service=service, options=options) # creates a running browser instance

class LoginPage:
    def __init__(self, driver): # __init__ = constructor, runs when LoginPage(driver) is called
        self.driver = driver    # self = this in JS — reference to the current instance
        self.wait = WebDriverWait(driver, 15) # waits up to 15 seconds

    def load(self):
        self.driver.get(f"{BASE_URL}/login")

    def fill_credentials(self, email, password):
        email_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))) # waits untill an element is presented in the DOM
        password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")

        email_input.send_keys(email)
        password_input.send_keys(password)
        
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    def get_error(self):
        return self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiAlert-root"))) # waits untill element is visible

def test_login_valid_credentials_redirects_to_dashboard():
    driver = make_driver()
    wait = WebDriverWait(driver, 15) # creates a 'waiter' attached to this browser intance (driver)
    try:
        # Arrange
        page = LoginPage(driver)
        page.load()

        # Act: fill in credentials and submit
        page.fill_credentials(EMAIL, PASSWORD)

        # Assert: URL changed to dashboard
        wait.until(EC.url_contains("/dashboard")) # waits untill URL contains a specific string (/dashboard)
        assert "/dashboard" in driver.current_url
    finally:  # guarantees driver.quit() always runs even if something crashes midway.
        driver.quit()

def test_login_invalid_credentials_shows_error():
    driver = make_driver()
    wait = WebDriverWait(driver, 15) # waits up to 15 seconds
    try:
        # Arrange
        page = LoginPage(driver)
        page.load()

        # Act
        page.fill_credentials("wrong@example.com", "wrongpassword")

        # Assert: stayed on login page, error message visible
        error = page.get_error() # waits untill element is visible
        assert error.is_displayed()
        assert "/login" in driver.current_url
    finally:
        driver.quit()