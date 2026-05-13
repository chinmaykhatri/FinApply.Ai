'use client';
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function FoundersPage() {
  return (
    <main>
      <Navbar />

      <section style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 40px 80px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 520 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.30)',
            letterSpacing: 3,
            marginBottom: 24,
          }}>
            THE TEAM
          </p>
          <h1 style={{
            fontSize: 40,
            fontWeight: 500,
            lineHeight: 1.2,
            background: 'linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 24px',
          }}>
            Founders
          </h1>
          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.50)',
            lineHeight: 1.7,
          }}>
            This page is coming soon. We are building FinApply to make finance hiring about capability, not credentials.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
