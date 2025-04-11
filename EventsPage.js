import React, { useState, useEffect } from 'react';
import './EventsPage.css';

function EventsPage({ account }) {
    const [events, setEvents] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        category: 'academic'
    });

    // Mock data for demo purposes
    useEffect(() => {
        // Simulate loading data from blockchain
        setTimeout(() => {
            const mockEvents = [
                {
                    id: 1,
                    title: 'Blockchain and DeFi Seminar',
                    description: 'Learn about the latest developments in blockchain technology and decentralized finance.',
                    location: 'Smith Technology Center, Room 308',
                    date: '2025-05-01',
                    startTime: '14:00',
                    endTime: '16:00',
                    category: 'academic',
                    organizer: '0x1234...abcd',
                    attendees: 42,
                    isAttending: false
                },
                {
                    id: 2,
                    title: 'Falcon Fest Spring 2025',
                    description: 'Annual spring festival with music, food, and activities for all Bentley students.',
                    location: 'Student Center Lawn',
                    date: '2025-04-15',
                    startTime: '12:00',
                    endTime: '20:00',
                    category: 'social',
                    organizer: '0x5678...efgh',
                    attendees: 214,
                    isAttending: true
                },
                {
                    id: 3,
                    title: 'Career Fair: Finance & Tech',
                    description: 'Employers from finance and tech industries recruiting for internships and full-time positions.',
                    location: 'LaCava Center',
                    date: '2025-04-10',
                    startTime: '10:00',
                    endTime: '15:00',
                    category: 'career',
                    organizer: '0x9abc...ijkl',
                    attendees: 156,
                    isAttending: false
                },
                {
                    id: 4,
                    title: 'Crypto Trading Workshop',
                    description: 'Hands-on workshop about cryptocurrency trading strategies and risk management.',
                    location: 'Smith Technology Center, Room 204',
                    date: '2025-04-08',
                    startTime: '16:00',
                    endTime: '18:00',
                    category: 'academic',
                    organizer: account,
                    attendees: 28,
                    isAttending: true
                }
            ];

            setEvents(mockEvents);
            setUserEvents(mockEvents.filter(event => event.isAttending || event.organizer === account));
            setLoading(false);
        }, 1000);
    }, [account]);

    const handleCreateEvent = (e) => {
        e.preventDefault();

        // In a real app, this would interact with a smart contract
        const newEventObj = {
            id: events.length + 1,
            ...newEvent,
            organizer: account,
            attendees: 0,
            isAttending: true
        };

        setEvents([...events, newEventObj]);
        setUserEvents([...userEvents, newEventObj]);

        // Reset form
        setNewEvent({
            title: '',
            description: '',
            location: '',
            date: '',
            startTime: '',
            endTime: '',
            category: 'academic'
        });
    };

    const toggleAttendance = (eventId) => {
        // Update events array
        setEvents(events.map(event => {
            if (event.id === eventId) {
                const isNowAttending = !event.isAttending;
                return {
                    ...event,
                    isAttending: isNowAttending,
                    attendees: isNowAttending ? event.attendees + 1 : event.attendees - 1
                };
            }
            return event;
        }));

        // Update user events
        const updatedEvent = events.find(e => e.id === eventId);
        if (updatedEvent.isAttending) {
            setUserEvents(userEvents.filter(e => e.id !== eventId));
        } else {
            setUserEvents([...userEvents, {...updatedEvent, isAttending: true}]);
        }
    };

    const filterEvents = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeTab === 'upcoming') {
            return events.filter(event => new Date(event.date) >= today)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (activeTab === 'myevents') {
            return userEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        return events;
    };

    const formatDateTime = (date, time) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const eventDate = new Date(date + 'T' + time);
        return eventDate.toLocaleDateString('en-US', options) + ' at ' +
            eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <div className="loading">Loading events...</div>;
    }

    return (
        <div className="events-page">
            <div className="events-header">
                <h1>Campus Events</h1>
                <div className="events-tabs">
                    <button
                        className={activeTab === 'upcoming' ? 'active' : ''}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming Events
                    </button>
                    <button
                        className={activeTab === 'myevents' ? 'active' : ''}
                        onClick={() => setActiveTab('myevents')}
                    >
                        My Events
                    </button>
                </div>
            </div>

            <div className="events-container">
                <div className="events-list">
                    {filterEvents().length === 0 ? (
                        <div className="no-events">No events found.</div>
                    ) : (
                        filterEvents().map(event => (
                            <div className="event-card" key={event.id}>
                                <div className={`event-category ${event.category}`}>
                                    {event.category === 'academic' && '🎓'}
                                    {event.category === 'social' && '🎉'}
                                    {event.category === 'career' && '💼'}
                                    {event.category === 'sports' && '🏆'}
                                    {' ' + event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                                </div>

                                <div className="event-details">
                                    <h3>{event.title}</h3>
                                    <p className="event-description">{event.description}</p>

                                    <div className="event-metadata">
                                        <div>
                                            <span className="event-location">📍 {event.location}</span>
                                        </div>
                                        <div>
                      <span className="event-time">
                        🕒 {formatDateTime(event.date, event.startTime)}
                      </span>
                                        </div>
                                        <div>
                                            <span className="event-attendees">👥 {event.attendees} attending</span>
                                        </div>
                                    </div>
                                </div>

                                {event.organizer === account ? (
                                    <div className="event-actions">
                                        <button className="your-event-button" disabled>
                                            You're the organizer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="event-actions">
                                        <button
                                            className={event.isAttending ? "leave-button" : "attend-button"}
                                            onClick={() => toggleAttendance(event.id)}
                                        >
                                            {event.isAttending ? 'Leave Event' : 'Attend Event'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="create-event-form">
                    <h3>Create New Event</h3>
                    <form onSubmit={handleCreateEvent}>
                        <div className="form-group">
                            <label>Event Title</label>
                            <input
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                placeholder="Enter event title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                placeholder="Describe your event"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                value={newEvent.location}
                                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                placeholder="Where will the event be held?"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group half">
                                <label>Category</label>
                                <select
                                    value={newEvent.category}
                                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                                    required
                                >
                                    <option value="academic">Academic</option>
                                    <option value="social">Social</option>
                                    <option value="career">Career</option>
                                    <option value="sports">Sports</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    value={newEvent.startTime}
                                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group half">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    value={newEvent.endTime}
                                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="create-button">Create Event</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EventsPage;