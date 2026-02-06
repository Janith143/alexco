
export const metadata = {
    title: "Contact Us | Alexco",
    description: "Get in touch with Alexco for sales inquiries, support, or service requests.",
};

export default function ContactPage() {
    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900">Contact Us</h1>
                <p className="text-slate-500 mt-4">
                    We're here to help with your solar and electrical needs.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white p-8 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="John" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-2 border rounded-lg" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input type="tel" className="w-full px-4 py-2 border rounded-lg" placeholder="+94 77 123 4567" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <select className="w-full px-4 py-2 border rounded-lg">
                                <option>Sales Inquiry</option>
                                <option>Technical Support</option>
                                <option>Service Request</option>
                                <option>Warranty Claim</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                            <textarea rows={4} className="w-full px-4 py-2 border rounded-lg" placeholder="How can we help you?"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-8 rounded-xl">
                        <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="text-2xl">📍</div>
                                <div>
                                    <div className="font-medium">Address</div>
                                    <div className="text-slate-300 text-sm">123 Main Street, Colombo 03, Sri Lanka</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-2xl">📞</div>
                                <div>
                                    <div className="font-medium">Phone</div>
                                    <div className="text-slate-300 text-sm">+94 11 234 5678</div>
                                    <div className="text-slate-300 text-sm">+94 77 987 6543</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-2xl">✉️</div>
                                <div>
                                    <div className="font-medium">Email</div>
                                    <div className="text-slate-300 text-sm">sales@alexco.lk</div>
                                    <div className="text-slate-300 text-sm">support@alexco.lk</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-2xl">🕐</div>
                                <div>
                                    <div className="font-medium">Business Hours</div>
                                    <div className="text-slate-300 text-sm">Mon - Fri: 8:30 AM - 5:30 PM</div>
                                    <div className="text-slate-300 text-sm">Saturday: 9:00 AM - 1:00 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl">
                        <h3 className="font-bold text-lg mb-2">Need Urgent Support?</h3>
                        <p className="text-blue-100 text-sm mb-4">
                            For emergency repairs and urgent technical issues, call our 24/7 hotline.
                        </p>
                        <div className="text-2xl font-bold">+94 77 ALEXCO</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
