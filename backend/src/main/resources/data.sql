-- No preloaded or hardcoded Administrator or Staff users whatsoever. Wiped clean!
-- No preloaded or hardcoded customer visits/appointments whatsoever. Wiped clean!

-- Seed Salon Services (14 Realistic Indian Salon Services with Category annotations)
INSERT INTO salon_services (id, name, price, description, category, active) VALUES 
(1, 'Haircut', 399.00, 'Classic trimming and styling by expert barber.', 'Hair Care', true),
(2, 'Hair Spa', 1499.00, 'Deep nourishing hot-oil treatment with scalp massage.', 'Hair Care', true),
(3, 'Facial Cleanup', 899.00, 'Fruit-based skin cleanup to restore standard facial glow.', 'Skin Care', true),
(4, 'Bridal Makeup', 8999.00, 'Exquisite elite bridal makeovers with premium cosmetic kits.', 'Bridal', true),
(5, 'Keratin Treatment', 4999.00, 'Smooth, protein-infused long-lasting hair straightening care.', 'Hair Care', true),
(6, 'Manicure', 699.00, 'Exquisite nail grooming with aromatic rose hand bath.', 'Nails', true),
(7, 'Pedicure', 999.00, 'Relaxing hot water foot soak with organic tan scrub.', 'Nails', true),
(8, 'Threading', 99.00, 'Quick precision eyebrow threading and shaping.', 'Grooming', true),
(9, 'Waxing', 799.00, 'Full arms and legs organic honey waxing treatment.', 'Grooming', true),
(10, 'Detan Facial', 1299.00, 'Powerful detanning pack with cooling cucumber mask.', 'Skin Care', true),
(11, 'Hair Coloring', 2499.00, 'Bespoke global hair colors or highlighting sessions.', 'Hair Care', true),
(12, 'Nail Art', 1499.00, 'Custom acrylic extensions with gorgeous modern art.', 'Nails', true),
(13, 'Smoothening', 5999.00, 'Smooth silk therapy to banish frizzy hair textures.', 'Hair Care', true),
(14, 'Head Massage', 499.00, 'Relaxing 30-min hot oil Ayurvedic massage.', 'Hair Care', true);

-- Adjust sequence values to prevent primary key conflicts on dynamic inserts
ALTER TABLE visits ALTER COLUMN id RESTART WITH 1;
ALTER TABLE salon_services ALTER COLUMN id RESTART WITH 15;
