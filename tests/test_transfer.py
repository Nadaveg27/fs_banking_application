from selenium import webdriver
from selenium.webdriver.chrome.options import Options # configures the browser before launch
from selenium.webdriver.chrome.service import Service as ChromeService # manages the driver process
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType
import pytest

BASE_URL = "https://fs-banking-application.vercel.app"
EMAIL = "rowan.96@melodydata.com"
PASSWORD = "111"
RECIPIENT_EMAIL = "skyler.r@matrixgiga.com"

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

    def login(self, email, password):
        email_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))) # waits untill an element is presented in the DOM
        self.driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys(password)
        email_input.send_keys(email)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

class TransferPage:
    def __init__(self, driver): # __init__ = constructor, runs when TransferPage(driver) is called
        self.driver = driver    # self = this in JS — reference to the current instance
        self.wait = WebDriverWait(driver, 15) # waits up to 15 seconds

    def load(self):
        self.driver.get(f"{BASE_URL}/transfer")

    def fill_transfer(self, recipient_email, amount, reason=None):
        recipient_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))) 
        amount_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter amount']")

        recipient_input.send_keys(recipient_email)
        amount_input.send_keys(str(amount))
        
        if reason:
            reason_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder=\"What's this transfer for?\"]")
            reason_input.send_keys(reason)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    def get_error(self):
        return self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiAlert-root"))) # waits untill element is visible

    def get_success_heading(self):
        return self.wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Transfer Complete')]"))) # waits for success state heading

    def get_back_to_dashboard_button(self):
        return self.wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Back to Dashboard')]")))

def test_transfer_happy_path():
    # NOTE: this test hits the real deployed backend and moves real money
    # in the production database. Balance of test account will decrease on each run.
    driver = make_driver()
    wait = WebDriverWait(driver, 15) # waits up to 15 seconds
    try:
        # Arrange: log in first, transfer page is protected
        login_page = LoginPage(driver)
        login_page.load()
        login_page.login(EMAIL, PASSWORD)
        wait.until(EC.url_contains("/dashboard")) # waits untill URL contains a specific string (/dashboard)

        # Navigate to transfer page
        transfer_page = TransferPage(driver)
        transfer_page.load()

        # Act: fill and submit transfer
        transfer_page.fill_transfer(recipient_email=RECIPIENT_EMAIL, amount=1)

        # Assert: success state rendered
        heading = transfer_page.get_success_heading()
        assert heading.is_displayed()

        # Assert: "Back to Dashboard" button present — only exists on success state
        back_btn = transfer_page.get_back_to_dashboard_button()
        assert back_btn.is_displayed()

        # Assert: URL stayed on transfer page (no redirect on success)
        assert "/transfer" in driver.current_url

        # Assert: URL changed to dashboard page when buttin pressed
        back_btn.click()
        wait.until(EC.url_contains("/dashboard"))
        assert "/dashboard" in driver.current_url
    finally:
        driver.quit()

def test_transfer_insufficient_balance_shows_error():
    driver = make_driver()
    wait = WebDriverWait(driver, 15) # waits up to 15 seconds
    try:
        # Arrange: log in first
        login_page = LoginPage(driver)
        login_page.load()
        login_page.login(EMAIL, PASSWORD)
        wait.until(EC.url_contains("/dashboard")) # waits untill URL contains a specific string (/dashboard)

        transfer_page = TransferPage(driver)
        transfer_page.load()

        # Act: attempt transfer with absurdly large amount
        transfer_page.fill_transfer(recipient_email=RECIPIENT_EMAIL, amount=999999999)

        # Assert: error message visible
        error = transfer_page.get_error()
        assert error.is_displayed()

        # Assert: stayed on transfer page
        assert "/transfer" in driver.current_url
    finally:
        driver.quit()

def test_transfer_nonexistent_recipient_shows_error():
    driver = make_driver()
    wait = WebDriverWait(driver, 15) # waits up to 15 seconds
    try:
        # Arrange: log in first
        login_page = LoginPage(driver)
        login_page.load()
        login_page.login(EMAIL, PASSWORD)
        wait.until(EC.url_contains("/dashboard")) # waits untill URL contains a specific string (/dashboard)

        transfer_page = TransferPage(driver)
        transfer_page.load()

        # Act: attempt transfer to nonexistent email
        transfer_page.fill_transfer(recipient_email="doesnotexist@nowhere.com", amount=1)

        # Assert: error message visible
        error = transfer_page.get_error()
        assert error.is_displayed()

        # Assert: stayed on transfer page
        assert "/transfer" in driver.current_url
    finally:
        driver.quit()