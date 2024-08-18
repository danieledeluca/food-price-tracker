<template>
    <header class="header">
        <div class="container">
            <nav>
                <ul>
                    <li>
                        <NuxtLink to="/">
                            <strong>Food Price Tracker</strong>
                        </NuxtLink>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
    <main class="main">
        <div class="container">
            <NuxtPage />
        </div>
    </main>
    <footer class="footer">
        <div class="container">
            <small>&copy; {{ new Date().getFullYear() }} - Daniele De Luca</small>
        </div>
    </footer>
</template>
