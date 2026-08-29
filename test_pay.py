"""Test script for the pay endpoint"""
import asyncio
import httpx

API_BASE = "http://localhost:8000/api/v1"

async def test_pay():
    async with httpx.AsyncClient(base_url=API_BASE, timeout=10.0) as client:
        # Create driver
        driver_email = f"driver_test_{__import__('uuid').uuid4().hex[:8]}@example.com"
        driver_reg = await client.post("/auth/register", json={
            "email": driver_email,
            "password": "Driver@123",
            "full_name": "Pay Driver",
            "role": "DRIVER"
        })
        print(f"Driver register: {driver_reg.status_code}")
        driver_token = driver_reg.json()["access_token"]
        d_headers = {"Authorization": f"Bearer {driver_token}"}
        
        # Create driver profile
        profile = await client.post("/transport/driver/profile", json={
            "name": "Pay Test Driver",
            "vehicle_type": "car",
            "vehicle_number": "DHK-PAY-001"
        }, headers=d_headers)
        print(f"Profile create: {profile.status_code}")
        if profile.status_code != 201:
            print(profile.text)
            return
        
        # Create passenger
        passenger_email = f"passenger_test_{__import__('uuid').uuid4().hex[:8]}@example.com"
        passenger_reg = await client.post("/auth/register", json={
            "email": passenger_email,
            "password": "Pass@12345",
            "full_name": "Passenger Pay",
            "role": "RESIDENT"
        })
        print(f"Passenger register: {passenger_reg.status_code}")
        p_token = passenger_reg.json()["access_token"]
        p_headers = {"Authorization": f"Bearer {p_token}"}
        
        # Book a ride
        book = await client.post("/transport/bookings", json={
            "vehicle_type": "car",
            "pickup_lat": 23.7808,
            "pickup_lon": 90.4074,
            "drop_lat": 23.8103,
            "drop_lon": 90.4125
        }, headers=p_headers)
        print(f"Book: {book.status_code}")
        booking = book.json()
        booking_id = booking["id"]
        print(f"Booking ID: {booking_id}")
        
        # Driver accepts
        accept = await client.post(f"/transport/driver/bookings/{booking_id}/accept", headers=d_headers)
        print(f"Accept: {accept.status_code}")
        
        # Start
        start = await client.patch(f"/transport/bookings/{booking_id}/status", json={"status": "IN_PROGRESS"}, headers=d_headers)
        print(f"Start: {start.status_code}")
        
        # Complete
        complete = await client.patch(f"/transport/bookings/{booking_id}/status", json={"status": "COMPLETED"}, headers=d_headers)
        print(f"Complete: {complete.status_code}")
        
        # Pay
        pay = await client.post(f"/transport/bookings/{booking_id}/pay", json={"payment_method": "bkash"}, headers=p_headers)
        print(f"Pay: {pay.status_code}")
        if pay.status_code != 200:
            print(pay.text)
        else:
            print(pay.json())

if __name__ == "__main__":
    asyncio.run(test_pay())