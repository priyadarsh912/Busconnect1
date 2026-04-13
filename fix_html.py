import re

# 1. stitch_assets/bus_arrivals.html
with open('stitch_assets/bus_arrivals.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Quick action cards to buttons
html = html.replace('<div class="bg-gradient-to-br from-primary', '<button type="button" aria-label="Route to Work" class="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-gradient-to-br from-primary')
# Find the closing div of the first quick action (after line 131)
# It's at line 139. Let's just do regex or manual.
html = re.sub(r'(<!-- Smart Actions -->.*?</div>\s*)(</div>)', r'\1</button>', html, count=1, flags=re.DOTALL)

html = html.replace('<div class="bg-white rounded-2xl p-4 text-on-surface shadow-sm border border-surface-container-high', '<button type="button" aria-label="Nearby Stops" class="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-white rounded-2xl p-4 text-on-surface shadow-sm border border-surface-container-high')
html = re.sub(r'(3 stops near you</p>\s*</div>\s*)(</div>)', r'\1</button>', html, count=1, flags=re.DOTALL)

# Arrival list rows: add focus rings
html = re.sub(r'(class="bg-surface-container-[^"]+?\s+cursor-pointer)', r'\1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1', html)
html = re.sub(r'(class="bg-white rounded-xl[^"]+?\s+cursor-pointer)', r'\1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1', html)

# Add keydown handler
if 'keydown' not in html:
    html = html.replace('</body>', '''<script>
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    if (e.target.matches('[role="button"][tabindex="0"]')) {
      e.preventDefault();
      e.target.click();
    }
  }
});
</script>
</body>''')

# Profile and hero images width/height
html = html.replace('alt="Close-up portrait', 'width="40" height="40" alt="Close-up portrait')
html = html.replace('alt="Modern bus stop station', 'width="600" height="192" alt="Modern bus stop station')

# aria-current
html = html.replace('aria-label="Nearby" ', 'aria-label="Nearby" aria-current="page" ')
html = html.replace('aria-label="Routes" aria-current="page" ', 'aria-label="Routes" ')

with open('stitch_assets/bus_arrivals.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Fixed bus_arrivals.html")

# 2. stitch_assets/live_tracking.html
with open('stitch_assets/live_tracking.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Bottom sheet responsive pb
html = html.replace('pb-12', 'pb-safe-bottom pb-24 md:pb-12')

# duplicate w-full
html = re.sub(r'class="fixed top-0 w-full(.*?)w-full', r'class="fixed top-0 w-full\1', html)

with open('stitch_assets/live_tracking.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed live_tracking.html")

# 3. stitch_assets/login_screen.html
with open('stitch_assets/login_screen.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(r'<span class="material-symbols-outlined ([^"]+)" data-icon="[^"]+">', r'<span class="material-symbols-outlined \1" aria-hidden="true">', html)

html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />', '<link rel="preconnect" href="https://fonts.googleapis.com" />')
html = html.replace('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />', '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />')
html = html.replace('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>', '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>')

# support and language
html = re.sub(r'<div class="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">\s*<span class="material-symbols-outlined text-on-surface-variant"[^>]*>help_outline</span>\s*<span class="text-sm font-semibold text-on-surface-variant">Support</span>\s*</div>', r'<button type="button" aria-label="Support" class="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary">\n<span class="material-symbols-outlined text-on-surface-variant" aria-hidden="true">help_outline</span>\n<span class="text-sm font-semibold text-on-surface-variant">Support</span>\n</button>', html)
html = re.sub(r'<div class="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">\s*<span class="material-symbols-outlined text-on-surface-variant"[^>]*>language</span>\s*<span class="text-sm font-semibold text-on-surface-variant">English</span>\s*</div>', r'<button type="button" aria-label="Change language" class="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary">\n<span class="material-symbols-outlined text-on-surface-variant" aria-hidden="true">language</span>\n<span class="text-sm font-semibold text-on-surface-variant">English</span>\n</button>', html)

html = html.replace('onsubmit="return false;"', 'onsubmit="event.preventDefault(); /* handleLogin logic */"')

html = html.replace('<a href="javascript:void(0)" class="text-primary font-bold ml-1 hover:underline decoration-2 underline-offset-4">', '<a href="#" onclick="event.preventDefault();" class="text-primary font-bold ml-1 hover:underline decoration-2 underline-offset-4">')

with open('stitch_assets/login_screen.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed login_screen.html")

# 4. stitch_assets/onboarding_alerts.html
with open('stitch_assets/onboarding_alerts.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('min-height: max(884px, 100dvh);', 'min-height: 100dvh;')
html = html.replace('overflow-hidden', '')

html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />', '<link rel="preconnect" href="https://fonts.googleapis.com" />')
html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin/>', '<link rel="preconnect" href="https://fonts.googleapis.com"/>')

with open('stitch_assets/onboarding_alerts.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed onboarding_alerts.html")

# 5. stitch_assets/onboarding_book.html
with open('stitch_assets/onboarding_book.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('min-height: max(884px, 100dvh);', 'min-height: 100dvh;')
html = html.replace('px-[-8px]', 'px-0')

with open('stitch_assets/onboarding_book.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed onboarding_book.html")

# 6. stitch_assets/onboarding_track.html
with open('stitch_assets/onboarding_track.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<button aria-label="Step 2 of 3"', '<span aria-label="Step 2 of 3"')
html = html.replace('<button aria-label="Step 3 of 3"', '<span aria-label="Step 3 of 3"')

with open('stitch_assets/onboarding_track.html', 'w', encoding='utf-8') as f:
    f.write(html.replace('</button>', '</span>', 2)) # hacky but let's carefully do it:
print("Fixed onboarding_track.html")

# Wait, let me fix it more targetedly for onboarding_track.html
with open('stitch_assets/onboarding_track.html', 'r', encoding='utf-8') as f:
    html = f.read()
    # just replace '<button aria-label="Step X' and its closing tag
    html = re.sub(r'<button([^>]+aria-label="Step \d of 3"[^>]*)>(.*?)</button>', r'<div\1>\2</div>', html, flags=re.DOTALL)
with open('stitch_assets/onboarding_track.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 7. stitch_assets/realistic_route_details.html
with open('stitch_assets/realistic_route_details.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = re.sub(r'<script src="https://cdn.tailwindcss.com\?plugins=forms,container-queries" integrity="[^"]*" crossorigin="anonymous"></script>', r'<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries" crossorigin="anonymous"></script>', html)
html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />', '<link rel="preconnect" href="https://fonts.googleapis.com" />')
html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin/>', '<link rel="preconnect" href="https://fonts.googleapis.com" />')
html = html.replace('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />', '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />')
html = html.replace('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>', '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />')

# "left-[51px]" -> "left-1/2 -translate-x-1/2" ? Actually I'll use "inset-x-0 mx-auto w-0" or something. The prompt says: "replace fixed pixel utility classes ... with percentage/spacing-based ... (e.g. use inset-x-*, left-1/4/left-1/2 or translate-x-1/2"
html = html.replace('left-[51px]', 'left-12 sm:left-16 md:left-24')
html = html.replace('left-[24px]', 'left-6 sm:left-8 md:left-12')
html = html.replace('top-[100px]', 'top-24 sm:top-32')

html = html.replace('https://lh3.googleusercontent.com/aida-public/AB6AXuDQqRjC55_56pWkH4z8zB05a41p4xZ0YQ7F4-2e90hR7E0k5h3S2F7T8yB0-Xw4C2x8nQ-9q6Y5L_0pU0mEwK5Pq7F4x5R5V7XqY9N9T5KzH8M2Q-', 'https://via.placeholder.com/150')
with open('stitch_assets/realistic_route_details.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed realistic_route_details.html")

# 8. stitch_assets/route_planner.html
with open('stitch_assets/route_planner.html', 'r', encoding='utf-8') as f:
    html = f.read()

if '.no-scrollbar' not in html:
    html = html.replace('</style>', '''  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>''')
with open('stitch_assets/route_planner.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed route_planner.html")

# 9. stitch_assets/tickets_screen.html
with open('stitch_assets/tickets_screen.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />', '<link rel="preconnect" href="https://fonts.googleapis.com" />')
html = html.replace('<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin/>', '<link rel="preconnect" href="https://fonts.googleapis.com" />')

html = html.replace('<div class="bg-surface-container rounded-2xl p-1 flex relative mb-8">', '<div role="tablist" class="bg-surface-container rounded-2xl p-1 flex relative mb-8">')
html = html.replace('<button class="flex-1 text-sm font-headline font-bold py-3 text-on-surface z-10 transition-colors">', '<button role="tab" aria-selected="true" aria-controls="active-tickets" tabindex="0" class="flex-1 text-sm font-headline font-bold py-3 text-on-surface z-10 transition-colors">')
html = html.replace('<button class="flex-1 text-sm font-headline font-bold py-3 text-outline z-10 transition-colors">', '<button role="tab" aria-selected="false" aria-controls="expired-tickets" tabindex="-1" class="flex-1 text-sm font-headline font-bold py-3 text-outline z-10 transition-colors">')

html = html.replace('<!-- Active Tickets -->', '<!-- Active Tickets -->\n<div id="active-tickets" role="tabpanel" tabindex="0">')
html = html.replace('<!-- BottomNavBar -->', '</div>\n<!-- BottomNavBar -->')
with open('stitch_assets/tickets_screen.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed tickets_screen.html")

# 10. stitch_assets/welcome_screen.html
with open('stitch_assets/welcome_screen.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<span class="font-label font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">Privacy Policy</span>', '<a href="/privacy" class="font-label font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">Privacy Policy</a>')
html = html.replace('<span class="font-label font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">Terms of Service</span>', '<a href="/terms" class="font-label font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">Terms of Service</a>')
html = html.replace('<span class="font-label font-bold text-xs uppercase tracking-widest text-primary hover:text-primary-container cursor-pointer transition-colors">Help Center</span>', '<a href="/help" class="font-label font-bold text-xs uppercase tracking-widest text-primary hover:text-primary-container cursor-pointer transition-colors">Help Center</a>')

html = html.replace('"primary-container": "#0096B0",', '"primary-container": "#0096B0",\n"secondary-container": "#ffdcc2",\n"tertiary-container": "#6cfe9f",')

with open('stitch_assets/welcome_screen.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed welcome_screen.html")

