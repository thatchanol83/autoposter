'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username')
    const password = formData.get('password')

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (
        username === adminUsername &&
        password === adminPassword
    ) {
        const cookieStore = await cookies()
        cookieStore.set('auth_token', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
            sameSite: 'lax',
        })

        redirect('/dashboard')
    } else {
        return { error: 'Invalid credentials' }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
    redirect('/login')
}
