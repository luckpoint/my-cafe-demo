import { auth } from '../utils/auth.js';

function initProfile() {
    const app = document.getElementById('app');
    const user = auth.getUser();

    if (!user) {
        window.location.href = '/?login=true';
        return;
    }

    app.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="max-w-3xl mx-auto">
            <!-- Profile Header -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                <div class="h-32 bg-primary"></div>
                <div class="px-8 pb-8 flex flex-col items-center -mt-16">
                    <img src="${user.image}" class="h-32 w-32 rounded-full border-4 border-white shadow-md bg-white" alt="${user.name}">
                    <h1 class="mt-4 text-3xl font-extrabold text-gray-900">${user.name}</h1>
                    <p class="text-gray-500">${user.email}</p>
                    <div class="mt-6 flex space-x-4">
                        <button class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Edit Profile
                        </button>
                        <button id="profile-logout-btn" class="px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <!-- Rewards Card -->
                <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Star Rewards</dt>
                                    <dd>
                                        <div class="text-lg font-medium text-gray-900">120 Stars</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                        <div class="mt-4">
                             <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-primary h-2.5 rounded-full" style="width: 80%"></div>
                             </div>
                             <p class="mt-2 text-xs text-gray-500">30 stars until next reward</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Order Mock -->
                 <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div class="p-6">
                        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                        <ul class="divide-y divide-gray-200">
                            <li class="py-3 flex justify-between">
                                <div class="text-sm">
                                    <p class="font-medium text-gray-900">Caffè Latte (Tall)</p>
                                    <p class="text-gray-500">Yesterday at 8:30 AM</p>
                                </div>
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                            </li>
                             <li class="py-3 flex justify-between">
                                <div class="text-sm">
                                    <p class="font-medium text-gray-900">Matcha Green Tea Latte</p>
                                    <p class="text-gray-500">15 Dec, 2:15 PM</p>
                                </div>
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                            </li>
                        </ul>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  `;

    document.getElementById('profile-logout-btn').addEventListener('click', auth.logout);
}

initProfile();
