-- Complaints: the operational table behind the dashboards, complaint list and CSV export.
-- Mirrors the four fields the Gemma classifier predicts so AI output can be stored alongside
-- the human-facing record.

CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'web',
  order_number TEXT,
  -- Gemma 3-270M multi-task predictions
  ai_is_actionable BOOLEAN,
  ai_info_complete BOOLEAN,
  ai_category TEXT,
  ai_resolution TEXT,
  satisfaction_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT complaints_status_check CHECK (status IN ('new','in-progress','resolved','escalated')),
  CONSTRAINT complaints_priority_check CHECK (priority IN ('low','medium','high','critical')),
  CONSTRAINT complaints_rating_check CHECK (satisfaction_rating BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS complaints_status_idx     ON public.complaints (status);
CREATE INDEX IF NOT EXISTS complaints_user_id_idx    ON public.complaints (user_id);
CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON public.complaints (created_at DESC);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read complaints"   ON public.complaints;
DROP POLICY IF EXISTS "Public insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Public update complaints" ON public.complaints;

-- This is a role-simulated demo with no real auth, so access is intentionally open.
CREATE POLICY "Public read complaints"   ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Public insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update complaints" ON public.complaints FOR UPDATE USING (true);

-- Seed: spread across the last 90 days so trend charts have a real shape.
INSERT INTO public.complaints
  (reference, user_id, customer_name, title, description, status, priority, category, channel,
   order_number, ai_is_actionable, ai_info_complete, ai_category, ai_resolution,
   satisfaction_rating, created_at, resolved_at)
VALUES
  ('COM-1001','user_001','Alice Johnson','Jacket arrived with torn lining','The inner lining is ripped along the left seam. Packaging was intact so it shipped damaged.','resolved','high','Damaged or Defective','web','ORD-45012',true,true,'Damaged or Defective','Replacement',5,now()-interval '86 days',now()-interval '84 days'),
  ('COM-1002','user_002','Bob Smith','Wrong size delivered','Ordered a US 10 but received a US 7. Label on the box says 10.','resolved','medium','Wrong Item','app','ORD-45013',true,true,'Wrong Item','Replacement',4,now()-interval '81 days',now()-interval '78 days'),
  ('COM-1003','user_003','Carol Davis','Package never arrived','Tracking shows delivered three days ago but nothing was received.','resolved','high','Delivery Issue','web','ORD-45014',true,false,'Delivery Issue','Refund',3,now()-interval '77 days',now()-interval '70 days'),
  ('COM-1004','user_004','David Wilson','Colour differs from listing','The listing shows navy, the delivered item is closer to black.','resolved','low','Product Quality','web','ORD-45015',true,true,'Product Quality','Partial Refund',4,now()-interval '74 days',now()-interval '71 days'),
  ('COM-1005','user_005','Eva Brown','Charged twice for one order','My statement shows two identical charges for the same order number.','resolved','critical','Billing','email','ORD-45016',true,true,'Billing','Refund',5,now()-interval '70 days',now()-interval '69 days'),
  ('COM-1006','user_006','Frank Miller','Zip broke after one wear','The zip pull detached completely the first time I wore the jacket.','resolved','medium','Damaged or Defective','app','ORD-45017',true,true,'Damaged or Defective','Replacement',4,now()-interval '66 days',now()-interval '62 days'),
  ('COM-1007','user_007','Grace Lee','Runs two sizes small','Sizing chart is inaccurate, the fit is far tighter than stated.','resolved','low','Sizing or Fit','web','ORD-45018',true,true,'Sizing or Fit','Exchange',3,now()-interval '63 days',now()-interval '60 days'),
  ('COM-1008','user_008','Henry Taylor','Item missing from parcel','Two items ordered, only one arrived. No note about a split shipment.','resolved','high','Delivery Issue','phone','ORD-45019',true,true,'Delivery Issue','Replacement',4,now()-interval '59 days',now()-interval '55 days'),
  ('COM-1009','user_001','Alice Johnson','Fabric pilled after one wash','Followed the care label exactly, the knit pilled badly across the sleeves.','resolved','medium','Product Quality','web','ORD-45020',true,true,'Product Quality','Partial Refund',3,now()-interval '55 days',now()-interval '50 days'),
  ('COM-1010','user_002','Bob Smith','Refund still not received','Return was confirmed two weeks ago, no refund has appeared yet.','resolved','high','Billing','email','ORD-45021',true,false,'Billing','Refund',2,now()-interval '52 days',now()-interval '44 days'),
  ('COM-1011','user_003','Carol Davis','Stitching unravelling at hem','The hem stitching came loose within days of normal wear.','resolved','medium','Damaged or Defective','app','ORD-45022',true,true,'Damaged or Defective','Replacement',4,now()-interval '48 days',now()-interval '45 days'),
  ('COM-1012','user_004','David Wilson','Checkout fails at payment step','Payment returns error 502 on every attempt using two different cards.','resolved','critical','Technical Issues','web','ORD-45023',true,true,'Technical Issues','Escalate to Support',4,now()-interval '44 days',now()-interval '43 days'),
  ('COM-1013','user_005','Eva Brown','Received a completely different product','Ordered a wool scarf, received a phone case.','resolved','high','Wrong Item','web','ORD-45024',true,true,'Wrong Item','Replacement',5,now()-interval '41 days',now()-interval '38 days'),
  ('COM-1014','user_006','Frank Miller','Delivery left in the rain','Parcel was left outdoors with no cover and the contents were soaked.','resolved','high','Delivery Issue','app','ORD-45025',true,true,'Delivery Issue','Refund',3,now()-interval '38 days',now()-interval '34 days'),
  ('COM-1015','user_007','Grace Lee','Belt loops misaligned','Manufacturing defect, the loops are visibly off-centre.','resolved','low','Damaged or Defective','web','ORD-45026',true,true,'Damaged or Defective','Partial Refund',4,now()-interval '35 days',now()-interval '31 days'),
  ('COM-1016','user_008','Henry Taylor','Promo code rejected at checkout','Valid promotional code is refused with no explanation.','resolved','medium','Technical Issues','web','ORD-45027',true,true,'Technical Issues','Escalate to Support',4,now()-interval '32 days',now()-interval '30 days'),
  ('COM-1017','user_001','Alice Johnson','Shoes arrived scuffed','Visible scuffing on both toes, item was sold as new.','resolved','medium','Damaged or Defective','app','ORD-45028',true,true,'Damaged or Defective','Replacement',4,now()-interval '29 days',now()-interval '26 days'),
  ('COM-1018','user_003','Carol Davis','Late delivery, missed the occasion','Guaranteed next-day delivery arrived four days late.','resolved','high','Delivery Issue','phone','ORD-45029',true,true,'Delivery Issue','Partial Refund',2,now()-interval '26 days',now()-interval '22 days'),
  ('COM-1019','user_005','Eva Brown','App crashes when opening orders','The orders tab closes the app immediately on Android.','in-progress','high','Technical Issues','app','ORD-45030',true,true,'Technical Issues','Escalate to Support',NULL,now()-interval '22 days',NULL),
  ('COM-1020','user_002','Bob Smith','Button fell off on first wear','A front button detached within an hour of wearing the shirt.','resolved','low','Damaged or Defective','web','ORD-45031',true,true,'Damaged or Defective','Replacement',5,now()-interval '20 days',now()-interval '17 days'),
  ('COM-1021','user_004','David Wilson','Wrong item and wrong size','Received the wrong product entirely, and in a size I never selected.','escalated','critical','Wrong Item','email','ORD-45032',true,false,'Wrong Item','Escalate to Support',NULL,now()-interval '18 days',NULL),
  ('COM-1022','user_006','Frank Miller','Fabric smells of chemicals','Strong chemical odour that has not faded after two washes.','in-progress','medium','Product Quality','web','ORD-45033',true,true,'Product Quality','Refund',NULL,now()-interval '16 days',NULL),
  ('COM-1023','user_007','Grace Lee','Cannot apply store credit','Store credit balance is visible but will not apply at checkout.','in-progress','medium','Technical Issues','app','ORD-45034',true,true,'Technical Issues','Escalate to Support',NULL,now()-interval '14 days',NULL),
  ('COM-1024','user_008','Henry Taylor','Return label will not generate','The returns portal errors out when generating a shipping label.','in-progress','high','Technical Issues','web','ORD-45035',true,true,'Technical Issues','Escalate to Support',NULL,now()-interval '12 days',NULL),
  ('COM-1025','user_001','Alice Johnson','Coat lining torn on arrival','Second damaged coat in a row from the same product line.','escalated','high','Damaged or Defective','phone','ORD-45036',true,true,'Damaged or Defective','Replacement',NULL,now()-interval '11 days',NULL),
  ('COM-1026','user_003','Carol Davis','Sizing chart does not match','Measured against the chart and the garment is 4cm narrower.','in-progress','low','Sizing or Fit','web','ORD-45037',true,true,'Sizing or Fit','Exchange',NULL,now()-interval '9 days',NULL),
  ('COM-1027','user_005','Eva Brown','Duplicate order placed by the site','The site submitted my order twice after a timeout.','in-progress','critical','Billing','email','ORD-45038',true,true,'Billing','Refund',NULL,now()-interval '8 days',NULL),
  ('COM-1028','user_002','Bob Smith','Parcel delivered to the wrong address','Tracking photo shows a door that is not mine.','new','high','Delivery Issue','app','ORD-45039',true,false,'Delivery Issue','Escalate to Support',NULL,now()-interval '6 days',NULL),
  ('COM-1029','user_004','David Wilson','Seam split along the shoulder','The shoulder seam opened under normal movement.','new','medium','Damaged or Defective','web','ORD-45040',true,true,'Damaged or Defective','Replacement',NULL,now()-interval '5 days',NULL),
  ('COM-1030','user_006','Frank Miller','Colour faded after first wash','Significant fading despite a cold wash as instructed.','new','medium','Product Quality','web','ORD-45041',true,true,'Product Quality','Partial Refund',NULL,now()-interval '4 days',NULL),
  ('COM-1031','user_007','Grace Lee','Order stuck in processing','Order has shown "processing" for nine days with no update.','new','high','Delivery Issue','app','ORD-45042',true,true,'Delivery Issue','Escalate to Support',NULL,now()-interval '3 days',NULL),
  ('COM-1032','user_008','Henry Taylor','Charged shipping on a free-shipping order','Free shipping threshold was met but shipping was still charged.','new','low','Billing','web','ORD-45043',true,true,'Billing','Partial Refund',NULL,now()-interval '2 days',NULL),
  ('COM-1033','user_001','Alice Johnson','Wrong colour variant shipped','Ordered burgundy, received grey. Invoice says burgundy.','new','medium','Wrong Item','web','ORD-45044',true,true,'Wrong Item','Replacement',NULL,now()-interval '2 days',NULL),
  ('COM-1034','user_003','Carol Davis','Cannot reset my password','Reset email never arrives, checked spam and other folders.','new','medium','Technical Issues','email','ORD-45045',true,false,'Technical Issues','Escalate to Support',NULL,now()-interval '1 day',NULL),
  ('COM-1035','user_005','Eva Brown','Defective zip on boots','The zip on the right boot jams halfway and will not close.','new','high','Damaged or Defective','app','ORD-45046',true,true,'Damaged or Defective','Replacement',NULL,now()-interval '18 hours',NULL),
  ('COM-1036','user_002','Bob Smith','Item not as described','Listing described genuine leather, the item is synthetic.','new','high','Product Quality','web','ORD-45047',true,true,'Product Quality','Refund',NULL,now()-interval '10 hours',NULL),
  ('COM-1037','user_004','David Wilson','Missing tracking information','No tracking number was issued four days after dispatch.','new','low','Delivery Issue','web','ORD-45048',true,false,'Delivery Issue','Escalate to Support',NULL,now()-interval '6 hours',NULL),
  ('COM-1038','user_006','Frank Miller','Double-charged on exchange','An exchange was processed as a new purchase and charged again.','new','critical','Billing','phone','ORD-45049',true,true,'Billing','Refund',NULL,now()-interval '3 hours',NULL)
ON CONFLICT (reference) DO NOTHING;
